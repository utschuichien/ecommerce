'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { CheckoutStepper } from './CheckoutStepper';
import { CheckoutRecipientForm } from './CheckoutRecipientForm';
import { CheckoutOrderSummary } from './CheckoutOrderSummary';
import { CheckoutPaymentForm } from './CheckoutPaymentForm';
import { CheckoutSuccessView } from './CheckoutSuccessView';
import {
  CheckoutItem,
  PaymentMethodType,
  RecipientInfo,
  ShippingMethod,
} from './checkout-types';
import { useCheckoutSummary, useCreateOrder } from '../../features/checkout';
import { useValidateVoucher } from '../../features/vouchers';
import { extractErrorMessage } from '../../lib/api-client';

/* ============================================================
 * HẰNG SỐ
 * ============================================================ */

// Số bước theo CheckoutStepper (bước 2 hiện không dùng nên nhảy 1 -> 3 -> 4)
const STEP = { INFO: 1, PAYMENT: 3, SUCCESS: 4 } as const;
type Step = (typeof STEP)[keyof typeof STEP];

type ShippingId = 'standard' | 'express';

const DEFAULT_STANDARD_FEE = 30000;

// Phí giao nhanh = phí chuẩn + phụ thu. Phí chuẩn lấy từ backend nếu có.
const SHIPPING_OPTIONS: ReadonlyArray<{
  id: ShippingId;
  name: string;
  estimate: string;
  surcharge: number;
}> = [
    { id: 'standard', name: 'Giao hàng tiêu chuẩn', estimate: 'Dự kiến giao 2 - 4 ngày', surcharge: 0 },
    { id: 'express', name: 'Giao hàng nhanh', estimate: 'Dự kiến giao 1 - 2 ngày', surcharge: 20000 },
  ];

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&auto=format&fit=crop&q=80';

const DEFAULT_RECIPIENT: RecipientInfo = {
  fullName: '',
  phone: '',
  address: '',
  line1: '',
  province: '',
  district: '',
  ward: '',
  saveToAddressBook: false,
  note: '',
};

/* ============================================================
 * HELPER
 * ============================================================ */

const formatVND = (n: number) => `${n.toLocaleString('vi-VN')}₫`;

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

// Số điện thoại VN: 0xxxxxxxxx hoặc +84/84xxxxxxxxx
const isValidPhone = (phone: string) => /^(0|\+?84)\d{9}$/.test(phone.replace(/[\s.-]/g, ''));

// Ảnh chụp lại đơn hàng ngay lúc đặt thành công
// (tránh việc giỏ hàng bị làm mới/xóa sau khi đặt khiến màn hình hoàn tất hiển thị rỗng)
interface PlacedOrder {
  orderId: string;
  recipient: RecipientInfo;
  items: CheckoutItem[];
  shipping: ShippingMethod;
  totalAmount: number;
}

/* ============================================================
 * CÁC MÀN HÌNH TRẠNG THÁI
 * ============================================================ */

function CheckoutLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
      <Loader2 className="w-7 h-7 text-emerald-600 animate-spin" />
      <p className="text-xs sm:text-sm text-gray-500">Đang chuẩn bị thông tin thanh toán...</p>
    </div>
  );
}

function CheckoutStateCard({
  tone,
  icon,
  title,
  description,
  action,
}: {
  tone: 'amber' | 'rose';
  icon: React.ReactNode;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  const toneClass = tone === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600';
  return (
    <div className="max-w-md mx-auto my-12 text-center p-8 bg-white border border-gray-100 rounded-2xl shadow-xs">
      <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center ${toneClass}`}>
        {icon}
      </div>
      <h2 className="mt-4 text-base font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 text-xs text-gray-500 leading-relaxed">{description}</p>
      <div className="mt-5 flex items-center justify-center">{action}</div>
    </div>
  );
}

const primaryLinkClass =
  'inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition active:scale-95 cursor-pointer';

const backLinkClass =
  'inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition cursor-pointer';

/* ============================================================
 * COMPONENT CHÍNH
 * ============================================================ */

const CHECKOUT_IDEMPOTENCY_STORAGE_KEY = 'checkout_order_idempotency';

/**
 * Tính dấu vân tay của giỏ hàng để nhận diện giỏ hàng có thay đổi hay không
 */
function getCheckoutFingerprint(
  items: Array<{ id: string; quantity: number }>,
  voucherCode?: string | null
): string {
  const sortedItems = [...items]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((it) => `${it.id}:${it.quantity}`)
    .join('|');
  return `${sortedItems}_v:${voucherCode || ''}`;
}

/**
 * Lấy hoặc sinh mới Idempotency Key tại thời điểm bấm thanh toán
 * Đảm bảo bền vững qua các lần reload trang (F5) nếu cùng giỏ hàng
 */
function getOrCreateCheckoutIdempotencyKey(fingerprint: string): string {
  try {
    const savedRaw = sessionStorage.getItem(CHECKOUT_IDEMPOTENCY_STORAGE_KEY);
    if (savedRaw) {
      const saved = JSON.parse(savedRaw);
      // Nếu cùng giỏ hàng và chưa quá 30 phút -> Dùng lại đúng key cũ
      if (
        saved.fingerprint === fingerprint &&
        saved.key &&
        Date.now() - (saved.createdAt || 0) < 30 * 60 * 1000
      ) {
        return saved.key;
      }
    }
  } catch {}

  // Chưa có hoặc giỏ hàng đã thay đổi -> Tạo key mới
  const newKey = `checkout_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  try {
    sessionStorage.setItem(
      CHECKOUT_IDEMPOTENCY_STORAGE_KEY,
      JSON.stringify({
        key: newKey,
        fingerprint,
        createdAt: Date.now(),
      })
    );
  } catch {}
  return newKey;
}

/**
 * Xóa Idempotency Key sau khi đặt hàng thành công
 */
function clearCheckoutIdempotencyKey() {
  try {
    sessionStorage.removeItem(CHECKOUT_IDEMPOTENCY_STORAGE_KEY);
  } catch {}
}

export function CheckoutView() {
  const [currentStep, setCurrentStep] = useState<Step>(STEP.INFO);
  const [selectedShippingId, setSelectedShippingId] = useState<ShippingId>('standard');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodType>('cod');
  const [recipient, setRecipient] = useState<RecipientInfo>(DEFAULT_RECIPIENT);
  const [appliedVoucherCode, setAppliedVoucherCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [voucherMessage, setVoucherMessage] = useState<string | null>(null);
  const [voucherStatus, setVoucherStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);

  const { data: summaryData, isLoading, error } = useCheckoutSummary();
  const createOrderMutation = useCreateOrder();
  const validateVoucherMutation = useValidateVoucher();

  /* ---------- Điền sẵn thông tin người nhận (chỉ 1 lần khi load từ DB) ---------- */
  const prefilledRef = useRef(false);
  useEffect(() => {
    if (!summaryData || prefilledRef.current) return;
    prefilledRef.current = true;

    if (summaryData.defaultAddress) {
      const addr = summaryData.defaultAddress;
      setRecipient((prev) => ({
        ...prev,
        fullName: addr.recipientName || prev.fullName,
        phone: addr.phone || prev.phone,
        address: addr.line1 || prev.address,
        line1: addr.line1 || prev.line1,
        province: addr.province || prev.province,
        district: addr.district || prev.district,
        ward: addr.ward || prev.ward,
      }));
    } else if (summaryData.userProfile) {
      // Nếu chưa có địa chỉ trong DB, chỉ điền tên/sđt nếu có, các ô địa chỉ để rỗng
      setRecipient((prev) => ({
        ...prev,
        fullName: summaryData.userProfile.fullName || prev.fullName,
        phone: summaryData.userProfile.phone || prev.phone,
      }));
    }
  }, [summaryData]);

  /* ---------- Dữ liệu sản phẩm hiển thị theo danh sách Cửa hàng (Shop) ---------- */
  const items: CheckoutItem[] = useMemo(
    () =>
      (summaryData?.shops || []).flatMap((shop) =>
        shop.items.map((it) => ({
          id: it.variantPublicId,
          productId: it.productSlug,
          name: it.productName,
          variant: it.variantLabel,
          price: it.unitPrice,
          quantity: it.quantity,
          image: it.imageUrl || FALLBACK_IMAGE,
          shopName: shop.name,
        })),
      ),
    [summaryData?.shops],
  );

  const standardFee = summaryData?.summary?.shippingFee ?? DEFAULT_STANDARD_FEE;

  const shippingMethods: ShippingMethod[] = useMemo(
    () =>
      SHIPPING_OPTIONS.map(({ surcharge, ...method }) => ({
        ...method,
        price: standardFee + surcharge,
      })),
    [standardFee],
  );

  const selectedShipping =
    shippingMethods.find((m) => m.id === selectedShippingId) ?? shippingMethods[0];
  const shippingFee = selectedShipping.price;

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const grandTotal = Math.max(0, subtotal + shippingFee - discount);

  /* ---------- Handlers ---------- */
  const handleChangeRecipient = (data: Partial<RecipientInfo>) =>
    setRecipient((prev) => ({ ...prev, ...data }));

  const handleApplyVoucher = async (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) {
      setVoucherMessage('Vui lòng nhập mã giảm giá.');
      setVoucherStatus('error');
      return;
    }

    try {
      const res = await validateVoucherMutation.mutateAsync({ code });
      if (res && res.valid) {
        setAppliedVoucherCode(res.voucher.code);
        setDiscount(res.discountAmount);
        setVoucherMessage(res.message);
        setVoucherStatus('success');
        toast.success('Đã áp dụng mã giảm giá', {
          description: `Bạn được giảm ${formatVND(res.discountAmount)}`,
        });
      }
    } catch (err: any) {
      setAppliedVoucherCode(null);
      setDiscount(0);
      const errMsg = extractErrorMessage(err, 'Mã giảm giá không hợp lệ hoặc đã hết hạn.');
      setVoucherMessage(errMsg);
      setVoucherStatus('error');
      toast.error('Không thể áp dụng mã', {
        description: errMsg,
      });
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucherCode(null);
    setDiscount(0);
    setVoucherMessage(null);
    setVoucherStatus('idle');
    toast.info('Đã hủy áp dụng mã giảm giá');
  };

  const goToStep = (step: Step) => {
    setCurrentStep(step);
    scrollToTop();
  };

  // Bước 1 -> 3: kiểm tra thông tin nhận hàng
  const handleContinueToPayment = () => {
    if (!recipient.fullName.trim() || !recipient.phone.trim() || !recipient.address.trim()) {
      toast.warning('Thiếu thông tin nhận hàng', {
        description: 'Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ giao hàng.',
      });
      return;
    }
    if (!isValidPhone(recipient.phone)) {
      toast.warning('Số điện thoại chưa hợp lệ', {
        description: 'Vui lòng nhập số điện thoại Việt Nam gồm 10 chữ số.',
      });
      return;
    }
    goToStep(STEP.PAYMENT);
  };

  // Bước 3 -> 4: tạo đơn hàng
  const handlePlaceOrder = async () => {
    if (createOrderMutation.isPending) return; // chặn bấm đúp

    if (selectedPayment !== 'cod') {
      toast.info('Phương thức chưa được hỗ trợ', {
        description: 'Hiện tại chỉ hỗ trợ thanh toán khi nhận hàng (COD).',
      });
      return;
    }

    // Chỉ khi bấm đặt hàng mới lấy hoặc sinh Idempotency Key (giữ nguyên khi F5 nếu cùng giỏ hàng)
    const fingerprint = getCheckoutFingerprint(items, appliedVoucherCode);
    const activeIdempotencyKey = getOrCreateCheckoutIdempotencyKey(fingerprint);

    try {
      const res = await createOrderMutation.mutateAsync({
        shippingAddress: {
          recipientName: recipient.fullName.trim(),
          phone: recipient.phone.trim(),
          line1: (recipient.line1 || recipient.address).trim(),
          ward: recipient.ward,
          district: recipient.district,
          province: recipient.province,
        },
        contactPhone: recipient.phone.trim(),
        paymentMethod: 'COD',
        shippingMethodId: selectedShippingId,
        voucherCode: appliedVoucherCode || undefined,
        note: recipient.note,
        idempotencyKey: activeIdempotencyKey,
      });

      // Đặt hàng thành công: Xóa key khỏi sessionStorage để phiên checkout sau sinh key mới
      clearCheckoutIdempotencyKey();

      const orderId = String(res.orderNumber || res.orderId);
      setPlacedOrder({
        orderId,
        recipient,
        items,
        shipping: selectedShipping,
        totalAmount: grandTotal,
      });
      toast.success('Đặt hàng thành công!', {
        description: `Mã đơn hàng của bạn là #${orderId}.`,
      });
      goToStep(STEP.SUCCESS);
    } catch (err: any) {
      // Nếu là lỗi nghiệp vụ (hết hàng, mã voucher sai...), xóa key để khách sửa và thử lại
      // Nếu là lỗi xung đột 409 hoặc lỗi mạng, GIỮ NGUYÊN key để bấm lại không tạo đơn trùng
      const status = err?.response?.status;
      if (status !== 409 && status !== 0 && !err?.message?.includes('Network Error')) {
        clearCheckoutIdempotencyKey();
      }

      toast.error('Đặt hàng thất bại', {
        description:
          err?.response?.data?.message ||
          (err instanceof Error && err.message
            ? err.message
            : 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng kiểm tra lại giỏ hàng và tồn kho.'),
      });
    }
  };

  const handleSubmitMainAction = () => {
    if (items.length === 0) {
      toast.warning('Đơn hàng trống', {
        description: 'Vui lòng chọn sản phẩm trong giỏ hàng trước khi thanh toán.',
      });
      return;
    }
    if (currentStep === STEP.INFO) {
      const formElem = document.getElementById(
        'checkout-recipient-form',
      ) as HTMLFormElement | null;
      if (formElem) {
        formElem.requestSubmit();
      } else {
        handleContinueToPayment();
      }
    } else if (currentStep === STEP.PAYMENT) {
      void handlePlaceOrder();
    }
  };

  const hintEditInCart = (title: string, description: string) => () =>
    toast.info(title, { description });

  /* ============================================================
   * RENDER
   * ============================================================ */

  // Màn hình hoàn tất: dùng ảnh chụp đơn hàng, không phụ thuộc giỏ hàng hiện tại
  if (currentStep === STEP.SUCCESS && placedOrder) {
    return (
      <div className="space-y-6 pb-20">
        <CheckoutStepper currentStep={STEP.SUCCESS} />
        <CheckoutSuccessView
          orderId={placedOrder.orderId}
          recipient={placedOrder.recipient}
          items={placedOrder.items}
          shipping={placedOrder.shipping}
          totalAmount={placedOrder.totalAmount}
        />
      </div>
    );
  }

  if (isLoading) return <CheckoutLoading />;

  if (error && !summaryData) {
    return (
      <CheckoutStateCard
        tone="rose"
        icon={<AlertCircle className="w-7 h-7" />}
        title="Không tải được thông tin thanh toán"
        description="Đã có lỗi khi tải dữ liệu đơn hàng. Vui lòng thử lại hoặc quay về giỏ hàng."
        action={
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => window.location.reload()} className={primaryLinkClass}>
              Thử lại
            </button>
            <Link href="/cart" className={backLinkClass}>
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Về giỏ hàng</span>
            </Link>
          </div>
        }
      />
    );
  }

  if (items.length === 0) {
    return (
      <CheckoutStateCard
        tone="amber"
        icon={<ShoppingBag className="w-7 h-7" />}
        title="Chưa có sản phẩm nào được chọn"
        description="Vui lòng chọn các sản phẩm bạn muốn đặt mua trong giỏ hàng để tiến hành thanh toán."
        action={
          <Link href="/cart" className={primaryLinkClass}>
            <ArrowLeft className="w-4 h-4" />
            <span>Về giỏ hàng để chọn sản phẩm</span>
          </Link>
        }
      />
    );
  }

  const submitButtonText =
    currentStep === STEP.INFO
      ? 'Tiếp tục thanh toán'
      : createOrderMutation.isPending
        ? 'Đang tạo đơn hàng...'
        : 'Đặt hàng (COD)';

  return (
    <div className="pb-2 sm:pb-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* CỘT TRÁI: quay lại, stepper, form */}
        <div className="lg:col-span-8 space-y-3">
          <div>
            {currentStep === STEP.PAYMENT ? (
              <button type="button" onClick={() => setCurrentStep(STEP.INFO)} className={backLinkClass}>
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại thông tin giao hàng</span>
              </button>
            ) : (
              <Link href="/cart" className={backLinkClass}>
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại giỏ hàng</span>
              </Link>
            )}
          </div>

          <CheckoutStepper
            currentStep={currentStep}
            onStepClick={(step) => {
              // Chỉ cho phép quay lại bước 1
              if (step === STEP.INFO) setCurrentStep(STEP.INFO);
            }}
          />

          {currentStep === STEP.INFO && (
            <CheckoutRecipientForm
              recipient={recipient}
              onChangeRecipient={handleChangeRecipient}
              shippingMethods={shippingMethods}
              selectedShippingId={selectedShippingId}
              onSelectShipping={(id) => setSelectedShippingId(id)}
              onValidSubmit={(data) => {
                const fullAddr = [
                  data.line1,
                  data.ward,
                  data.district,
                  data.province,
                ]
                  .filter(Boolean)
                  .join(', ');
                setRecipient({
                  fullName: data.fullName,
                  phone: data.phone,
                  province: data.province,
                  district: data.district,
                  ward: data.ward,
                  line1: data.line1,
                  address: fullAddr,
                  saveToAddressBook: data.saveToAddressBook,
                  note: data.note || '',
                });
                goToStep(STEP.PAYMENT);
              }}
            />
          )}

          {currentStep === STEP.PAYMENT && (
            <CheckoutPaymentForm
              selectedPayment={selectedPayment}
              onSelectPayment={(method) => setSelectedPayment(method)}
              recipient={recipient}
              selectedShipping={selectedShipping}
              onBackToAddress={() => setCurrentStep(STEP.INFO)}
            />
          )}
        </div>

        {/* CỘT PHẢI: tóm tắt đơn hàng (chỉ dính khi màn hình rộng) */}
        <div className="lg:col-span-4 lg:sticky lg:top-16">
          <CheckoutOrderSummary
            items={items}
            shippingFee={shippingFee}
            discount={discount}
            onUpdateQuantity={hintEditInCart(
              'Chỉnh sửa số lượng',
              'Vui lòng điều chỉnh số lượng trực tiếp trong giỏ hàng.',
            )}
            onRemoveItem={hintEditInCart(
              'Bỏ chọn sản phẩm',
              'Vui lòng bỏ chọn sản phẩm trong giỏ hàng để cập nhật thanh toán.',
            )}
            onApplyVoucher={handleApplyVoucher}
            onRemoveVoucher={handleRemoveVoucher}
            appliedVoucherCode={appliedVoucherCode}
            voucherMessage={voucherMessage}
            voucherStatus={voucherStatus}
            isApplyingVoucher={validateVoucherMutation.isPending}
            onSubmitOrder={handleSubmitMainAction}
            isLoading={createOrderMutation.isPending}
            submitButtonText={submitButtonText}
          />
        </div>
      </div>
    </div>
  );
}