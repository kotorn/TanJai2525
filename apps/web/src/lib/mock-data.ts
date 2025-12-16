export const STRESS_TEST_DATA = {
    MENU_ITEMS: [
        {
            id: 'item-1',
            name: 'ก๋วยเตี๋ยวต้มยำหมูเด้งไข่ออนเซ็นจัมโบ้พิเศษใส่ทุกอย่าง (เผ็ดนรกแตก)',
            description: 'สุดยอดก๋วยเตี๋ยวต้มยำที่รวบรวมวัตถุดิบชั้นเลิศจากทั่วทุกมุมโลกมาไว้ในชามเดียว รับประกันความอร่อยจนต้องร้องขอชีวิต',
            price: 999.99,
            image: '/images/tom_yum.png',
            category: 'Main Course',
        },
        { id: 'item-somtum', name: 'ส้มตำไทย', price: 50, category: 'Appetizer', image: '/images/som_tum.png' },
        { id: 'item-chicken', name: 'ไก่ย่าง', price: 80, category: 'Main Course', image: '/images/grilled_chicken.png' },
        { id: 'item-rice', name: 'ข้าวเหนียว', price: 10, category: 'Side Dish', image: '/images/sticky_rice.png' },
        { id: 'item-juice', name: 'น้ำส้ม', price: 25, category: 'Beverage', image: '/images/orange_juice.png' },
        { id: 'item-dessert', name: 'ขนมหวาน', price: 30, category: 'Dessert', image: '/images/dessert.png' },
    ],
    LONG_TEXT: {
        THAI: 'นี่คือข้อความยาวมากๆ เพื่อทดสอบการตัดคำของระบบว่าจะแสดงผลได้ถูกต้องหรือไม่ ถ้าข้อความยาวเกินไปจะเกิดอะไรขึ้น',
        ENGLISH: 'This is a very long text string to test the text wrapping and truncation capabilities of the UI component.',
    },
    FAT_FINGER_TARGET: 44,
};
