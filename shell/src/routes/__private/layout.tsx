import PrivateLayout from '../../components/PrivateLayout';

// Mọi route trong nhóm __private đi qua PrivateLayout:
// guard đăng nhập + Nav + AutoSignOut + consume navigateLink.
export default PrivateLayout;
