import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { Plus, User, Loader2, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Users, Calendar, BookOpen, FileText, Trophy, TrendingUp, Clock, Edit } from 'lucide-react';
import authService from '../../services/auth.service';
import { updateUserValidity } from '../../services/user.service';
import { useUsers } from '../../hooks/useUsers';
import type { UserStudent } from '../../types/api.types';

export function UserManagement() {
  // Hook pour gérer les utilisateurs
  const { 
    activeStudents, 
    inactiveStudents, 
    isLoading: loadingUsers,
    error: usersError,
    selectedUserStats,
    fetchStudents,
    fetchUserStatistics,
    clearSelectedUser
  } = useUsers();

  // États locaux pour la création d'utilisateur
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // États pour l'affichage
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  
  // États pour la modification de validité
  const [isEditValidityDialogOpen, setIsEditValidityDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<UserStudent | null>(null);
  const [isUpdatingValidity, setIsUpdatingValidity] = useState(false);
  const [validityFormData, setValidityFormData] = useState({
    activation_start_date: new Date().toISOString().split('T')[0],
    activation_weeks: 4
  });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    activation_start_date: new Date().toISOString().split('T')[0],
    activation_weeks: 4
  });

  /**
   * Toggle pour afficher/masquer les détails d'un étudiant
   */
  const handleToggleExpand = async (userId: number) => {
    if (expandedUserId === userId) {
      // Fermer les détails
      setExpandedUserId(null);
      clearSelectedUser();
    } else {
      // Ouvrir les détails
      setExpandedUserId(userId);
      await fetchUserStatistics(userId);
    }
  };

  /**
   * Soumission du formulaire de création d'utilisateur
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setSuccess(null);

    if (!formData.name.trim() || !formData.email.trim()) {
      setCreateError('Veuillez remplir tous les champs');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setCreateError('Veuillez entrer une adresse email valide');
      return;
    }

    if (formData.activation_weeks < 1 || formData.activation_weeks > 52) {
      setCreateError('La durée d\'activation doit être entre 1 et 52 semaines');
      return;
    }

    try {
      setIsCreating(true);
      await authService.createUser({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        activation_start_date: formData.activation_start_date,
        activation_weeks: formData.activation_weeks
      });

      const endDate = new Date(formData.activation_start_date);
      endDate.setDate(endDate.getDate() + (formData.activation_weeks * 7));
      
      setSuccess(
        `Utilisateur "${formData.name}" créé avec succès ! 
        Mot de passe: student123 
        Actif jusqu'au ${endDate.toLocaleDateString('fr-FR')}`
      );
      
      setFormData({
        name: '',
        email: '',
        activation_start_date: new Date().toISOString().split('T')[0],
        activation_weeks: 4
      });
      setIsCreateDialogOpen(false);
      
      // Recharger la liste des étudiants
      await fetchStudents();
      
      setTimeout(() => setSuccess(null), 7000);
    } catch (err: any) {
      setCreateError(err.message || 'Erreur lors de la création de l\'utilisateur');
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Annuler la création d'utilisateur
   */
  const handleCancel = () => {
    setFormData({
      name: '',
      email: '',
      activation_start_date: new Date().toISOString().split('T')[0],
      activation_weeks: 4
    });
    setCreateError(null);
    setIsCreateDialogOpen(false);
  };

  /**
   * Ouvrir le dialog de modification de validité
   */
  const handleOpenEditValidity = (userId: number) => {
    const student = [...activeStudents, ...inactiveStudents].find(s => s.id === userId);
    if (!student) return;
    
    setEditingStudent(student);
    
    // Calculer la date de début et les semaines à partir de activation_end_date si disponible
    const startDate = student.activation_start_date 
      ? new Date(student.activation_start_date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    
    // Calculer le nombre de semaines si on a start et end date
    let weeks = 4; // Par défaut
    if (student.activation_start_date && student.activation_end_date) {
      const start = new Date(student.activation_start_date);
      const end = new Date(student.activation_end_date);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      weeks = Math.ceil(diffDays / 7);
    }
    
    setValidityFormData({
      activation_start_date: startDate,
      activation_weeks: weeks
    });
    setIsEditValidityDialogOpen(true);
  };

  /**
   * Soumettre la modification de validité
   */
  const handleUpdateValidity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    setCreateError(null);
    setSuccess(null);

    if (validityFormData.activation_weeks < 1 || validityFormData.activation_weeks > 104) {
      setCreateError('La durée d\'activation doit être entre 1 et 104 semaines (2 ans)');
      return;
    }

    try {
      setIsUpdatingValidity(true);
      await updateUserValidity(
        editingStudent.id,
        validityFormData.activation_start_date,
        validityFormData.activation_weeks
      );

      const endDate = new Date(validityFormData.activation_start_date);
      endDate.setDate(endDate.getDate() + (validityFormData.activation_weeks * 7));

      setSuccess(
        `Validité de "${editingStudent.name}" mise à jour ! Actif jusqu'au ${endDate.toLocaleDateString('fr-FR')}`
      );

      setIsEditValidityDialogOpen(false);
      setEditingStudent(null);

      // Recharger la liste des étudiants
      await fetchStudents();

      setTimeout(() => setSuccess(null), 7000);
    } catch (err: any) {
      setCreateError(err.message || 'Erreur lors de la mise à jour de la validité');
    } finally {
      setIsUpdatingValidity(false);
    }
  };

  /**
   * Annuler la modification de validité
   */
  const handleCancelEditValidity = () => {
    setEditingStudent(null);
    setValidityFormData({
      activation_start_date: new Date().toISOString().split('T')[0],
      activation_weeks: 4
    });
    setCreateError(null);
    setIsEditValidityDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestion des utilisateurs</h2>
          <p className="text-slate-600">Créer de nouveaux comptes étudiants</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouvel utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent className="!max-w-[500px]" aria-describedby="create-user-description">
              <DialogHeader>
                <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
                <DialogDescription id="create-user-description">
                  L'utilisateur recevra automatiquement le mot de passe "student123"
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {createError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{createError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ex: Jean Dupont"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={isCreating}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jean.dupont@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={isCreating}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activation_start_date">Date de début d'activation</Label>
                  <Input
                    id="activation_start_date"
                    type="date"
                    value={formData.activation_start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, activation_start_date: e.target.value }))}
                    disabled={isCreating}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activation_weeks">Durée d'activation (semaines)</Label>
                  <Input
                    id="activation_weeks"
                    type="number"
                    min="1"
                    max="52"
                    placeholder="Ex: 4"
                    value={formData.activation_weeks}
                    onChange={(e) => setFormData(prev => ({ ...prev, activation_weeks: parseInt(e.target.value) || 4 }))}
                    disabled={isCreating}
                    required
                  />
                  <p className="text-xs text-slate-500">
                    Le compte sera actif pendant {formData.activation_weeks} semaine{formData.activation_weeks > 1 ? 's' : ''}
                  </p>
                </div>

                <DialogFooter className="gap-2">
                  <Button type="button" variant="outline" onClick={handleCancel} disabled={isCreating}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Création...
                      </>
                    ) : (
                      <>
                        <User className="mr-2 h-4 w-4" />
                        Créer l'utilisateur
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Message de succès */}
      {success && (
        <Alert className="border-green-200 bg-blue-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Dialog de modification de validité */}
      <Dialog open={isEditValidityDialogOpen} onOpenChange={setIsEditValidityDialogOpen}>
        <DialogContent className="!max-w-[500px]" aria-describedby="validity-dialog-description">
          <DialogHeader>
            <DialogTitle>Modifier la date de validité</DialogTitle>
            <DialogDescription id="validity-dialog-description">
              Modifier la période d'activation pour {editingStudent?.name}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateValidity} className="space-y-4">
            {createError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{createError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="validity_start_date">Date de début d'activation</Label>
              <Input
                id="validity_start_date"
                type="date"
                value={validityFormData.activation_start_date}
                onChange={(e) => setValidityFormData(prev => ({ ...prev, activation_start_date: e.target.value }))}
                disabled={isUpdatingValidity}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validity_weeks">Durée d'activation (semaines)</Label>
              <Input
                id="validity_weeks"
                type="number"
                min="1"
                max="104"
                placeholder="Ex: 4"
                value={validityFormData.activation_weeks}
                onChange={(e) => setValidityFormData(prev => ({ ...prev, activation_weeks: parseInt(e.target.value) || 4 }))}
                disabled={isUpdatingValidity}
                required
              />
              <p className="text-xs text-slate-500">
                Le compte sera actif pendant {validityFormData.activation_weeks} semaine{validityFormData.activation_weeks > 1 ? 's' : ''}
                {' '}(jusqu'au {new Date(new Date(validityFormData.activation_start_date).getTime() + validityFormData.activation_weeks * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')})
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={handleCancelEditValidity} disabled={isUpdatingValidity}>
                Annuler
              </Button>
              <Button type="submit" disabled={isUpdatingValidity}>
                {isUpdatingValidity ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Mettre à jour
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Erreur lors du chargement */}
      {usersError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{usersError}</AlertDescription>
        </Alert>
      )}

      {/* Liste des étudiants actifs */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Étudiants actifs ({activeStudents.length})
        </h3>

        {loadingUsers ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : activeStudents.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-slate-500">
              Aucun étudiant actif
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeStudents.map(student => (
              <StudentCard
                key={student.id}
                student={student}
                isExpanded={expandedUserId === student.id}
                statistics={expandedUserId === student.id ? selectedUserStats : null}
                onToggleExpand={handleToggleExpand}
                isLoadingStats={loadingUsers && expandedUserId === student.id}
                onUpdateValidity={handleOpenEditValidity}
              />
            ))}
          </div>
        )}
      </div>

      {/* Section utilisateurs inactifs */}
      {inactiveStudents.length > 0 && (
        <div className="space-y-4">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow border-slate-300"
            onClick={() => setShowInactive(!showInactive)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600">
                  <Users className="w-5 h-5" />
                  Étudiants inactifs ({inactiveStudents.length})
                </span>
                {showInactive ? (
                  <ChevronUp className="w-5 h-5 text-slate-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-500" />
                )}
              </CardTitle>
            </CardHeader>
          </Card>

          {showInactive && (
            <div className="space-y-3">
              {inactiveStudents.map(student => (
                <StudentCard
                  key={student.id}
                  student={student}
                  isExpanded={false}
                  statistics={null}
                  onToggleExpand={() => {}}
                  isLoadingStats={false}
                  isInactive
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * 🔥 Composant Card pour afficher un étudiant
 */
interface StudentCardProps {
  student: UserStudent;
  isExpanded: boolean;
  statistics: any;
  onToggleExpand: (userId: number) => void;
  isLoadingStats: boolean;
  isInactive?: boolean;
  onUpdateValidity?: (userId: number) => void;
}

function StudentCard({ 
  student, 
  isExpanded, 
  statistics, 
  onToggleExpand, 
  isLoadingStats,
  isInactive = false,
  onUpdateValidity
}: StudentCardProps) {
  const [showThemeProgress, setShowThemeProgress] = useState(false);
  
  const getDaysRemainingColor = (days: number | null) => {
    if (days === null || days < 0) return 'text-red-600 bg-red-50';
    if (days <= 7) return 'text-orange-600 bg-orange-50';
    if (days <= 14) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getDaysRemainingText = (days: number | null) => {
    if (days === null || days < 0) return 'Expiré';
    if (days === 0) return 'Expire aujourd\'hui';
    if (days === 1) return '1 jour restant';
    return `${days} jours restants`;
  };

  return (
    <Card className={`transition-all ${isInactive ? 'opacity-60 border-slate-300' : 'border-blue-200'}`}>
      <CardHeader 
        className="pb-3 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => !isInactive && onToggleExpand(student.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              {student.name}
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">{student.email}</p>
          </div>
          
          <div className="flex items-center gap-3">
            {!isInactive && student.days_remaining !== null && (
              <>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getDaysRemainingColor(student.days_remaining)}`}>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {getDaysRemainingText(student.days_remaining)}
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateValidity?.(student.id);
                  }}
                  className="flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Modifier
                </Button>
              </>
            )}
            
            {isInactive && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-slate-200 text-slate-600">
                Inactif
              </span>
            )}

            {!isInactive && (
              isExpanded ? (
                <ChevronUp className="w-5 h-5 text-slate-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-500" />
              )
            )}
          </div>
        </div>
      </CardHeader>

      {/* Détails étendus */}
      {isExpanded && !isInactive && (
        <CardContent className="pt-0 space-y-4 border-t">
          {isLoadingStats ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : statistics ? (
            <>
              {/* Progression par thème */}
              <div className="space-y-3">
                <div 
                  className="font-semibold text-slate-700 flex items-center justify-between cursor-pointer hover:text-slate-900"
                  onClick={() => setShowThemeProgress(!showThemeProgress)}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Progression par thème
                  </div>
                  {showThemeProgress ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
                
                {showThemeProgress && (
                  statistics.themeProgress && statistics.themeProgress.length > 0 ? (
                    <div className="space-y-2">
                      {statistics.themeProgress.map((theme: any) => (
                        <div key={theme.theme_id} className="bg-slate-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-slate-700">{theme.theme_name}</span>
                            <span className="text-sm text-slate-600">
                              {theme.completed_questions}/{theme.total_questions} questions
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2 mb-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${theme.progress_percentage}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Progression: {theme.progress_percentage}%</span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              Score: {theme.score}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">Aucune progression enregistrée</p>
                  )
                )}
              </div>

              {/* Statistiques des examens blancs */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Examens blancs
                </h4>
                {statistics.mockExamStats ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-slate-600">Tentatives</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        {statistics.mockExamStats.total_attempts}
                      </p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Trophy className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-slate-600">Meilleure note</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {statistics.mockExamStats.best_score}%
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-slate-600">Moyenne</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">
                        {statistics.mockExamStats.average_score}%
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">Aucun examen blanc effectué</p>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500 italic">Erreur lors du chargement des statistiques</p>
          )}
        </CardContent>
      )}
    </Card>
  );
}