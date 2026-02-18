import React, { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Menu, Home, Users, Car, Wrench, DollarSign, Settings, LogOut, UserCog } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { t, isRTL } = useLanguage();
  const location = useLocation();
  
  // Check if we're on equipment details page
  const isEquipmentDetailsPage = location.pathname.startsWith('/equipment/') && location.pathname !== '/equipment';

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigationItems = [
    { path: '/dashboard', label: t('dashboard'), icon: <Home className="h-4 w-4" /> },
    { path: '/employees', label: t('employees'), icon: <Users className="h-4 w-4" /> },
    { path: '/vehicles', label: t('vehicles'), icon: <Car className="h-4 w-4" /> },
    { path: '/equipment', label: t('equipment'), icon: <Wrench className="h-4 w-4" />, highlight: isEquipmentDetailsPage },
    { path: '/finance', label: t('finance'), icon: <DollarSign className="h-4 w-4" /> },
    { path: '/settings', label: t('settings'), icon: <Settings className="h-4 w-4" /> },
  ];

  const Sidebar = () => (
    <aside className="w-64 bg-gray-900 text-white shadow-lg hidden lg:block">
      <div className="p-4 sm:p-6 border-b border-gray-700">
        <h1 className="text-lg sm:text-2xl font-bold text-center">نظام إدارة الوحدات الجهوية للحرس الوطني</h1>
      </div>
      <nav className="mt-4 sm:mt-6">
        {navigationItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex w-full items-center gap-3 px-4 sm:px-6 py-2 sm:py-3 text-right hover:bg-gray-800 cursor-pointer transition-colors text-sm ${
              item.highlight ? 'bg-gray-800' : ''
            }`}
          >
            <span className="h-4 w-4 flex-shrink-0">{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );

  const MobileSidebar = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-64 sm:w-80 p-0">
        <div className="bg-gray-900 text-white h-full">
          <div className="p-4 sm:p-6 border-b border-gray-700">
            <h1 className="text-lg sm:text-xl font-bold text-center">نظام إدارة الوحدات الجهوية للحرس الوطني</h1>
          </div>
          <nav className="mt-4 sm:mt-6">
            {navigationItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex w-full items-center gap-3 px-4 sm:px-6 py-2 sm:py-3 text-right hover:bg-gray-800 cursor-pointer transition-colors text-sm ${
                  item.highlight ? 'bg-gray-800' : ''
                }`}
              >
                <span className="h-4 w-4 flex-shrink-0">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );

  const getRoleDisplay = (role?: string | { name: string }) => {
    if (!role) return 'غير محدد';
    
    const roleName = typeof role === 'string' ? role : role.name;
    
    switch (roleName.toLowerCase()) {
      case 'admin': return 'مدير';
      case 'manager': return 'مدير فرعي';
      case 'user': return 'مستخدم';
      default: return roleName;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              {/* Mobile Menu */}
              <div className="lg:hidden">
                <MobileSidebar />
              </div>
              
              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex-1 text-center px-2 sm:px-4 truncate">
                {title || t('dashboard')}
              </h2>

              {/* User Menu */}
              <div className="flex items-center gap-2">
                {/* Mobile User Info */}
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-sm text-muted-foreground hidden xs:block">
                    {user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : user.username}
                  </span>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={user.username} />
                        <AvatarFallback className="text-xs">
                          {user.firstName?.[0] || user.username?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 sm:w-64" align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-sm">
                          {user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : user.username}
                        </p>
                        <p className="w-[200px] truncate text-xs sm:text-sm text-muted-foreground">
                          {user.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{user.username} • {getRoleDisplay(user.role)}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/users')}>
                      <UserCog className="mr-2 h-4 w-4" />
                      <span className="text-sm">إدارة المستخدمين</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span className="text-sm">{t('logout')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="max-w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
