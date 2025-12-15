export const STRESS_TEST_DATA = {
    MENU_ITEMS: [
        {
            id: 'item-1',
            name: 'ก๋วยเตี๋ยวต้มยำหมูเด้งไข่ออนเซ็นจัมโบ้พิเศษใส่ทุกอย่าง (เผ็ดนรกแตก)',
            description: 'สุดยอดก๋วยเตี๋ยวต้มยำที่รวบรวมวัตถุดิบชั้นเลิศจากทั่วทุกมุมโลกมาไว้ในชามเดียว รับประกันความอร่อยจนต้องร้องขอชีวิต',
            price: 999.99,
            image: '/images/menu-placeholder-fail.jpg', // Intentionally broken for fallback test
            category: 'Main Course',
        },
        {
            id: 'item-2',
            name: 'ข้าวผัด',
            description: '', // Empty description test
            price: 0, // Free item test
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
            category: 'Side Dish',
        },
    ],
    LONG_TEXT: {
        THAI: 'นี่คือข้อความยาวมากๆ เพื่อทดสอบการตัดคำของระบบว่าจะแสดงผลได้ถูกต้องหรือไม่ ถ้าข้อความยาวเกินไปจะเกิดอะไรขึ้น',
        ENGLISH: 'This is a very long text string to test the text wrapping and truncation capabilities of the UI component.',
    },
    FAT_FINGER_TARGET: 44, // Minimum touch target size in px
};
