import { useState } from 'react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LogOut, Moon, Sun } from 'lucide-react';
import type { User } from '../types';
import { ThemeManagement } from './admin/ThemeManagement';
import { QuestionManagement } from './admin/QuestionManagement';
import { MockExamManagement } from './admin/MockExamManagement';
import { UserManagement } from './admin/UserManagement';
import { useTheme } from '../contexts/ThemeContext';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('themes');
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-2">Tableau de bord administrateur</h1>
            <p className="text-gray-600">Bienvenue, {user.name || user.email.split('@')[0]}</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={toggleDarkMode}
              className="p-2"
              title={isDarkMode ? "Mode clair" : "Mode sombre"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="w-full bg-white rounded-xl shadow-md p-4 border border-slate-200">
            <TabsList className="h-auto bg-transparent p-0 flex flex-wrap gap-3 justify-start border-0">
              <TabsTrigger 
                value="themes" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:bg-slate-100 data-[state=inactive]:text-slate-700 data-[state=inactive]:hover:bg-slate-200 py-3 px-6 text-base font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md border-0"
              >
                📚 Thèmes
              </TabsTrigger>
              <TabsTrigger 
                value="questions" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:bg-slate-100 data-[state=inactive]:text-slate-700 data-[state=inactive]:hover:bg-slate-200 py-3 px-6 text-base font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md border-0"
              >
                ❓ Questions
              </TabsTrigger>
              <TabsTrigger 
                value="exams" 
                className="data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=inactive]:bg-slate-100 data-[state=inactive]:text-slate-700 data-[state=inactive]:hover:bg-slate-200 py-3 px-6 text-base font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md border-0"
              >
                📝 Examens blancs
              </TabsTrigger>
              <TabsTrigger 
                value="users" 
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=inactive]:bg-slate-100 data-[state=inactive]:text-slate-700 data-[state=inactive]:hover:bg-slate-200 py-3 px-6 text-base font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md border-0"
              >
                👥 Utilisateurs
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="themes">
            <ThemeManagement />
          </TabsContent>

          <TabsContent value="questions">
            <QuestionManagement />
          </TabsContent>

          <TabsContent value="exams">
            <MockExamManagement />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
