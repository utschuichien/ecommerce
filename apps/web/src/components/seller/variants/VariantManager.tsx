'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Zap, Layers, Sparkles } from 'lucide-react';
import { ProductVariantItem } from '../seller-types';

export interface OptionGroup {
  id: string;
  name: string;
  values: string[];
}

interface VariantManagerProps {
  hasVariants: boolean;
  onToggleHasVariants: (enabled: boolean) => void;
  variants: ProductVariantItem[];
  onChangeVariants: (variants: ProductVariantItem[]) => void;
  baseSku?: string;
  errors?: Record<string, string>;
}

function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .toUpperCase();
}

export function VariantManager({
  hasVariants,
  onToggleHasVariants,
  variants,
  onChangeVariants,
  baseSku = 'SKU',
  errors = {},
}: VariantManagerProps) {
  // Option groups (e.g. Group 1: Màu sắc, Group 2: Kích cỡ / Dung lượng)
  const [groups, setGroups] = useState<OptionGroup[]>(() => {
    // Thử trích xuất groups từ existing variants
    if (variants && variants.length > 0 && variants[0].optionValues) {
      const keys = Object.keys(variants[0].optionValues);
      if (keys.length > 0) {
        return keys.map((key, idx) => {
          const valSet = new Set<string>();
          variants.forEach((v) => {
            if (v.optionValues && v.optionValues[key]) {
              valSet.add(v.optionValues[key]);
            }
          });
          return {
            id: `group-${idx}`,
            name: key,
            values: Array.from(valSet),
          };
        });
      }
    }
    return [
      { id: 'group-1', name: 'Màu sắc', values: [] },
    ];
  });

  const [tagInputs, setTagInputs] = useState<Record<string, string>>({});
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkStock, setBulkStock] = useState('');

  // Tự động sinh ma trận biến thể khi groups thay đổi (nếu có ít nhất 1 group có giá trị)
  const regenerateMatrix = (currentGroups: OptionGroup[]) => {
    const activeGroups = currentGroups.filter(
      (g) => g.name.trim() !== '' && g.values.length > 0
    );

    if (activeGroups.length === 0) {
      onChangeVariants([]);
      return;
    }

    // Cartesian product
    let combinations: Record<string, string>[] = [{}];

    for (const group of activeGroups) {
      const nextCombinations: Record<string, string>[] = [];
      for (const comb of combinations) {
        for (const val of group.values) {
          nextCombinations.push({
            ...comb,
            [group.name.trim()]: val.trim(),
          });
        }
      }
      combinations = nextCombinations;
    }

    // Map thành ProductVariantItem, giữ lại giá/kho cũ nếu cùng optionValues
    const newVariants: ProductVariantItem[] = combinations.map((comb, index) => {
      // Tìm variant cũ có optionValues khớp
      const existingMatch = variants.find((v) => {
        if (!v.optionValues) return false;
        const vKeys = Object.keys(v.optionValues);
        const combKeys = Object.keys(comb);
        if (vKeys.length !== combKeys.length) return false;
        return combKeys.every((k) => v.optionValues?.[k] === comb[k]);
      });

      if (existingMatch) {
        return existingMatch;
      }

      // Tạo SKU mới
      const skuSuffix = Object.values(comb)
        .map((v) => slugify(v).slice(0, 4))
        .join('-');
      const generatedSku = `${slugify(baseSku || 'SKU')}-${skuSuffix}-${index + 1}`;

      return {
        sku: generatedSku,
        price: bulkPrice ? Number(bulkPrice) : 0,
        stock: bulkStock ? Number(bulkStock) : 0,
        optionValues: comb,
      };
    });

    onChangeVariants(newVariants);
  };

  const handleAddGroup = () => {
    if (groups.length >= 2) return; // Tối đa 2 nhóm thuộc tính (như Shopee/Lazada)
    const newGroups = [
      ...groups,
      { id: `group-${Date.now()}`, name: 'Kích cỡ', values: [] },
    ];
    setGroups(newGroups);
  };

  const handleRemoveGroup = (groupId: string) => {
    const newGroups = groups.filter((g) => g.id !== groupId);
    setGroups(newGroups);
    regenerateMatrix(newGroups);
  };

  const handleGroupNameChange = (groupId: string, name: string) => {
    const newGroups = groups.map((g) => (g.id === groupId ? { ...g, name } : g));
    setGroups(newGroups);
  };

  const handleAddTag = (groupId: string) => {
    const tagText = (tagInputs[groupId] || '').trim();
    if (!tagText) return;

    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    if (group.values.includes(tagText)) {
      setTagInputs((prev) => ({ ...prev, [groupId]: '' }));
      return;
    }

    const updatedGroups = groups.map((g) =>
      g.id === groupId ? { ...g, values: [...g.values, tagText] } : g
    );
    setGroups(updatedGroups);
    setTagInputs((prev) => ({ ...prev, [groupId]: '' }));
    regenerateMatrix(updatedGroups);
  };

  const handleRemoveTag = (groupId: string, tagVal: string) => {
    const updatedGroups = groups.map((g) =>
      g.id === groupId ? { ...g, values: g.values.filter((v) => v !== tagVal) } : g
    );
    setGroups(updatedGroups);
    regenerateMatrix(updatedGroups);
  };

  const handleVariantChange = (
    index: number,
    field: keyof ProductVariantItem,
    value: any
  ) => {
    const updated = [...variants];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChangeVariants(updated);
  };

  const handleRemoveVariantRow = (index: number) => {
    const updated = variants.filter((_, idx) => idx !== index);
    onChangeVariants(updated);
  };

  const handleApplyBulk = () => {
    if (!bulkPrice && !bulkStock) return;
    const priceNum = bulkPrice ? Number(bulkPrice) : undefined;
    const stockNum = bulkStock ? Number(bulkStock) : undefined;

    const updated = variants.map((v) => ({
      ...v,
      price: priceNum !== undefined ? priceNum : v.price,
      stock: stockNum !== undefined ? stockNum : v.stock,
    }));
    onChangeVariants(updated);
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Toggle switch bật tắt phân loại hàng */}
      <div className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-xl border border-gray-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
              Phân loại sản phẩm (Biến thể)
              <span className="text-[10px] font-normal text-emerald-700 bg-emerald-100/60 px-1.5 py-0.2 rounded">
                Màu sắc, Size, Dung lượng...
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              Bật tính năng này nếu sản phẩm có nhiều phiên bản với giá và tồn kho riêng
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const next = !hasVariants;
            onToggleHasVariants(next);
            if (next && variants.length === 0) {
              regenerateMatrix(groups);
            }
          }}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
            hasVariants ? 'bg-emerald-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
              hasVariants ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {hasVariants && (
        <div className="space-y-4 p-4 bg-emerald-50/20 rounded-xl border border-emerald-100 animate-in fade-in duration-200">
          {/* Nhóm thuộc tính phân loại */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Nhóm thuộc tính phân loại
              </span>
              {groups.length < 2 && (
                <button
                  type="button"
                  onClick={handleAddGroup}
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm nhóm phân loại
                </button>
              )}
            </div>

            {groups.map((group, groupIdx) => (
              <div
                key={group.id}
                className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-[11px] font-semibold text-gray-500 whitespace-nowrap">
                      Nhóm {groupIdx + 1}:
                    </span>
                    <input
                      type="text"
                      value={group.name}
                      onChange={(e) => handleGroupNameChange(group.id, e.target.value)}
                      placeholder="Tên nhóm (ví dụ: Màu sắc, Size)"
                      className="px-2.5 py-1 text-xs border border-gray-200 rounded-md focus:border-emerald-500 focus:outline-hidden w-44"
                    />
                  </div>
                  {groups.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveGroup(group.id)}
                      className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                      title="Xóa nhóm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Danh sách các giá trị phân loại */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {group.values.map((val) => (
                    <span
                      key={val}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200"
                    >
                      {val}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(group.id, val)}
                        className="text-gray-400 hover:text-red-500 ml-0.5 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  {/* Input thêm giá trị mới */}
                  <div className="inline-flex items-center gap-1">
                    <input
                      type="text"
                      value={tagInputs[group.id] || ''}
                      onChange={(e) =>
                        setTagInputs((prev) => ({ ...prev, [group.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag(group.id);
                        }
                      }}
                      placeholder="+ Nhập giá trị rồi bấm Enter"
                      className="px-2 py-1 text-xs border border-dashed border-gray-300 rounded-md focus:border-emerald-500 focus:outline-hidden w-48 bg-gray-50/50"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTag(group.id)}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md cursor-pointer font-medium"
                    >
                      Thêm
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Thanh áp dụng nhanh cho tất cả biến thể */}
          {variants.length > 0 && (
            <div className="p-3 bg-white rounded-lg border border-gray-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-800 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Áp dụng nhanh cho tất cả ({variants.length} phân loại):
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-[120px]">
                  <input
                    type="number"
                    value={bulkPrice}
                    onChange={(e) => setBulkPrice(e.target.value)}
                    placeholder="Giá bán (₫)"
                    className="w-full px-2.5 py-1 text-xs border border-gray-200 rounded-md focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div className="flex-1 min-w-[100px]">
                  <input
                    type="number"
                    value={bulkStock}
                    onChange={(e) => setBulkStock(e.target.value)}
                    placeholder="Kho hàng"
                    className="w-full px-2.5 py-1 text-xs border border-gray-200 rounded-md focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyBulk}
                  className="px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-md cursor-pointer transition whitespace-nowrap"
                >
                  Áp dụng tất cả
                </button>
              </div>
            </div>
          )}

          {/* Bảng chi tiết từng phân loại */}
          {variants.length > 0 ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">
                  Danh sách phân loại ({variants.length})
                </span>
                {errors.variants && (
                  <span className="text-[11px] text-red-500 font-medium">
                    {errors.variants}
                  </span>
                )}
              </div>

              <div className="border border-gray-200 rounded-lg overflow-x-auto bg-white shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                    <tr>
                      <th className="py-2 px-3">Phân loại</th>
                      <th className="py-2 px-2 w-32">Mã SKU</th>
                      <th className="py-2 px-2 w-32">Giá bán (₫) *</th>
                      <th className="py-2 px-2 w-24">Tồn kho *</th>
                      <th className="py-2 px-2 w-10 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {variants.map((v, idx) => {
                      const label = v.optionValues
                        ? Object.values(v.optionValues).join(' - ')
                        : `Biến thể #${idx + 1}`;
                      return (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="py-2 px-3 font-medium text-gray-800">
                            <span className="inline-block bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                              {label}
                            </span>
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={v.sku}
                              onChange={(e) =>
                                handleVariantChange(idx, 'sku', e.target.value)
                              }
                              className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:border-emerald-500 focus:outline-hidden font-mono"
                              placeholder="SKU"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              value={v.price === 0 ? '' : v.price}
                              onChange={(e) =>
                                handleVariantChange(
                                  idx,
                                  'price',
                                  e.target.value === '' ? 0 : Number(e.target.value)
                                )
                              }
                              className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:border-emerald-500 focus:outline-hidden"
                              placeholder="≥ 1.000"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              value={v.stock === 0 ? '' : v.stock}
                              onChange={(e) =>
                                handleVariantChange(
                                  idx,
                                  'stock',
                                  e.target.value === '' ? 0 : Number(e.target.value)
                                )
                              }
                              className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:border-emerald-500 focus:outline-hidden"
                              placeholder="≥ 0"
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveVariantRow(idx)}
                              className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                              title="Xóa phân loại này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-gray-400 bg-white rounded-lg border border-dashed border-gray-200">
              Nhập các giá trị cho nhóm thuộc tính ở trên để hệ thống tự động sinh bảng phân loại.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
