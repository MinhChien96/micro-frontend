// ★ Contract công khai của remote — quy ước bank: mỗi dòng import component
// tự động thành một expose "./X" (đọc bởi generateExposes() trong
// module-federation.config.ts).
//
// Pattern B (zone): expose DUY NHẤT cửa vào CardsRoutes — remote tự quản
// toàn bộ router con dưới /cards/*; shell truyền module router qua props.
import CardsRoutes from './CardsRoutes';

export default { CardsRoutes };
