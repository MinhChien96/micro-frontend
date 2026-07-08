// ★ Contract công khai của remote — quy ước bank: mỗi dòng import component
// tự động thành một expose "./X" (đọc bởi generateExposes() trong
// module-federation.config.ts). Muốn expose component mới: thêm 1 dòng import
// + thêm vào object export default bên dưới.
import ProfileApp from './ProfileApp';

export default { ProfileApp };
