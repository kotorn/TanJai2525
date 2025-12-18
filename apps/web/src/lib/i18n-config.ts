export const LANGUAGES = [
  { code: 'th', label: 'ไทย', flag: '🇹🇭', font: 'font-thai' },
  { code: 'en', label: 'English', flag: '🇬🇧', font: 'font-sans' },
  { code: 'my', label: 'မြန်မာ (Burmese)', flag: '🇲🇲', font: 'font-burmese' },
  { code: 'shn', label: 'လိၵ်ႈတႆး (Tai Yai)', flag: '🇱🇹', font: 'font-burmese' }, // Using Myanmar font which supports Shan
  { code: 'lo', label: 'ລາວ (Lao)', flag: '🇱🇦', font: 'font-lao' },
  { code: 'jp', label: '日本語 (Japanese)', flag: '🇯🇵', font: 'font-sans' },
  { code: 'cn', label: '中文 (Chinese)', flag: '🇨🇳', font: 'font-sans' },
  { code: 'vn', label: 'Tiếng Việt (Vietnamese)', flag: '🇻🇳', font: 'font-sans' },
];

export const TRANSLATIONS = {
  th: {
    title: 'ตานใจ POS',
    search: 'ค้นหาเมนู...',
    category_all: 'ทั้งหมด',
    addToCart: 'ใส่ตะกร้า',
    total: 'ยอดรวม',
    items: 'รายการ',
    checkout: 'ชำระเงิน',
    currency: '฿'
  },
  en: {
    title: 'Tanjai POS',
    search: 'Search menu...',
    category_all: 'All',
    addToCart: 'Add',
    total: 'Total',
    items: 'items',
    checkout: 'Checkout',
    currency: 'THB'
  },
  my: {
    title: 'Tanjai POS',
    search: 'မီနူးရှာဖွေပါ...',
    category_all: 'အားလုံး',
    addToCart: 'ထည့်ပါ',
    total: 'စုစုပေါင်း',
    items: 'ပစ္စည်းများ',
    checkout: 'ငွေချေမည်',
    currency: '฿'
  },
  shn: {
    title: 'Tanjai POS',
    search: 'သွၵ်ႈႁႃ...',
    category_all: 'တင်းမူတ်း',
    addToCart: 'သႂ်ႇ',
    total: 'တင်းမူတ်း',
    items: 'ဢၼ်',
    checkout: 'ပၼ်ငိုၼ်း',
    currency: '฿'
  },
  lo: {
    title: 'Tanjai POS',
    search: 'ຄົ້ນຫາເມນູ...',
    category_all: 'ທັງໝົດ',
    addToCart: 'ເພີ່ມ',
    total: 'ລວມ',
    items: 'ລາຍການ',
    checkout: 'ຊຳລະເງິນ',
    currency: '฿'
  },
  jp: {
    title: 'Tanjai POS',
    search: 'メニューを検索...',
    category_all: 'すべて',
    addToCart: '追加',
    total: '合計',
    items: '点',
    checkout: 'チェックアウト',
    currency: '¥'
  },
  cn: {
    title: 'Tanjai POS',
    search: '搜索菜单...',
    category_all: '全部',
    addToCart: '添加',
    total: '总计',
    items: '件',
    checkout: '结账',
    currency: '¥'
  },
  vn: {
    title: 'Tanjai POS',
    search: 'Tìm menu...',
    category_all: 'Tất cả',
    addToCart: 'Thêm',
    total: 'Tổng cộng',
    items: 'món',
    checkout: 'Thanh toán',
    currency: '₫'
  }
};
