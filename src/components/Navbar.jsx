import { ShoppingCart, PawPrint } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <PawPrint className="text-petOrange w-8 h-8" />
          <div>
            <h1 className="text-xl font-bold text-petBlue leading-none">KLERKSDORP HONDEKOS</h1>
            <p className="text-xs text-gray-500 italic">Family Business Est. 2014</p>
          </div>
        </Link>
        
        <div className="flex gap-6 items-center">
          <Link to="/admin" className="text-sm text-gray-400 hover:text-petBlue">Admin</Link>
          <Link to="/checkout" className="relative">
            <ShoppingCart className="text-petBlue w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-petOrange text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">0</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}