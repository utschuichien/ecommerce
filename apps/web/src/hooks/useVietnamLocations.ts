import locationsData from '@/data/vietnam-locations.json';

export interface DistrictData {
  name: string;
  wards: string[];
}

export interface ProvinceData {
  name: string;
  districts: DistrictData[];
}

const locations: ProvinceData[] = locationsData as ProvinceData[];

export function useVietnamLocations(selectedProvince?: string, selectedDistrict?: string) {
  // Danh sách tất cả 63 Tỉnh / Thành phố
  const provinces = locations.map((p) => p.name);

  // Danh sách Quận / Huyện thuộc Tỉnh được chọn
  const currentProvince = locations.find((p) => p.name === selectedProvince);
  const districts = currentProvince ? currentProvince.districts.map((d) => d.name) : [];

  // Danh sách Phường / Xã thuộc Huyện được chọn
  const currentDistrict = currentProvince?.districts.find((d) => d.name === selectedDistrict);
  const wards = currentDistrict ? currentDistrict.wards : [];

  return {
    provinces,
    districts,
    wards,
  };
}
