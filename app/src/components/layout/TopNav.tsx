import { NavLink } from "react-router-dom";

export function TopNav() {
  return (
    <header className="top-nav">
      <div className="nav-brand">
        <div>
          <span className="brand-title">منصة التراث الإسلامي التفاعلي</span>
          <span className="brand-subtitle">كتب التراث الإسلامي، تفاعلياً</span>
        </div>
      </div>
      <nav className="nav-tools">
        <NavLink to="/" end>
          الرئيسية
        </NavLink>
        <NavLink to="/about">عن المنصة</NavLink>
      </nav>
    </header>
  );
}
