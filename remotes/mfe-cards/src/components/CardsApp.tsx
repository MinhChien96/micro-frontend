import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import CardsRoutes from './CardsRoutes';

// CHỈ dùng cho chế độ STANDALONE: tự cấp router module (react-router-dom
// local) cho zone. Khi chạy trong shell, shell truyền module router của nó
// qua routes/__private/cards/$.tsx (Pattern B).
export default function CardsApp() {
  return (
    <CardsRoutes
      Routes={Routes}
      Route={Route}
      Link={Link}
      useNavigate={useNavigate}
      useParams={useParams}
    />
  );
}
