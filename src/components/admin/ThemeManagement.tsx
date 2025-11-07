import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { 
  Plus, Pencil, Trash2, Loader2, CheckCircle, AlertCircle, 
  BookOpen, Upload, X
} from 'lucide-react';
import { getAllThemes, createTheme, updateTheme, deleteTheme } from '../../services/theme.service';
import { uploadThemeImage } from '../../services/upload.service';
import type { Theme, CreateThemeRequest } from '../../types/api.types';

export function ThemeManagement() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // États pour l'upload d'image
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateThemeRequest>({
    title: '',
    description: '',
    icon: '',
    color: '',
    display_order: 0
  });

  useEffect(() => {
    loadThemes();
  }, []);

  const loadThemes = async () => {
    try {
      setIsLoading(true);
      const data = await getAllThemes();
      setThemes(data);
    } catch (err: any) {
      setError('Erreur lors du chargement des thèmes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.title.trim()) {
      setError('Le titre est requis');
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (editingTheme) {
        await updateTheme(editingTheme.id, formData);
        setSuccess(`Thème "${formData.title}" modifié avec succès`);
        setIsEditDialogOpen(false);
      } else {
        await createTheme(formData);
        setSuccess(`Thème "${formData.title}" créé avec succès`);
        setIsCreateDialogOpen(false);
      }
      
      resetForm();
      loadThemes();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (theme: Theme) => {
    setEditingTheme(theme);
    setFormData({
      title: theme.title,
      description: theme.description || '',
      icon: theme.icon || '',
      color: theme.color || '',
      display_order: theme.display_order || 0
    });
    setImagePreview(theme.icon || null);
    setIsEditDialogOpen(true);
  };

  const handleDeleteTheme = async (theme: Theme) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le thème "${theme.title}" ? Toutes les questions associées seront également supprimées.`)) {
      return;
    }

    try {
      await deleteTheme(theme.id);
      setSuccess(`Thème "${theme.title}" supprimé avec succès`);
      loadThemes();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      icon: '',
      color: '',
      display_order: 0
    });
    setEditingTheme(null);
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleCancel = () => {
    resetForm();
    setError(null);
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
  };

  /**
   * Gestion de la sélection d'image
   */
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      // Créer un aperçu
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Supprimer l'image sélectionnée
   */
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, icon: '' }));
  };

  /**
   * Upload de l'image et mise à jour du formulaire
   */
  const handleUploadImage = async () => {
    if (!selectedImage) return;

    try {
      setUploadingImage(true);
      const result = await uploadThemeImage(selectedImage);
      
      // Mettre à jour le champ icon avec l'URL de l'image
      setFormData(prev => ({ ...prev, icon: result.imageUrl }));
      setSuccess('Image uploadée avec succès');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'upload de l\'image');
    } finally {
      setUploadingImage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestion des thèmes</h2>
          <p className="text-slate-600">Créer et gérer les thèmes de quiz</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau thème
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg" aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>Créer un nouveau thème</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="title">Nom du thème *</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Ex: Navigation maritime"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Description du thème..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    disabled={isSubmitting}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium">Image du thème (optionnel)</span>
                  
                  {imagePreview || formData.icon ? (
                    <div className="space-y-2">
                      <div className="relative w-full max-w-xs mx-auto h-32 border-2 border-dashed border-slate-300 rounded-lg overflow-hidden">
                        <img 
                          src={imagePreview || formData.icon} 
                          alt="Aperçu" 
                          className="w-full h-full object-contain bg-slate-50"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                          aria-label="Supprimer l'image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {selectedImage && !formData.icon && (
                        <Button
                          type="button"
                          onClick={handleUploadImage}
                          disabled={uploadingImage}
                          size="sm"
                          className="w-full"
                        >
                          {uploadingImage ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Upload en cours...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Uploader l'image
                            </>
                          )}
                        </Button>
                      )}
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-slate-300" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-slate-500">Ou</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="icon-url">Modifier l'URL d'image</Label>
                        <Input
                          id="icon-url"
                          type="url"
                          placeholder="https://exemple.com/image.jpg"
                          value={formData.icon || ''}
                          onChange={(e) => {
                            const url = e.target.value;
                            setFormData(prev => ({ ...prev, icon: url }));
                            setImagePreview(url || null);
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                        <p className="text-sm text-slate-600 mb-2">
                          Glissez une image ou cliquez pour sélectionner
                        </p>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          disabled={isSubmitting}
                          className="cursor-pointer"
                        />
                      </div>
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-slate-300" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-slate-500">Ou</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="icon-url">Entrez une URL d'image</Label>
                        <Input
                          id="icon-url"
                          type="url"
                          placeholder="https://exemple.com/image.jpg"
                          value={formData.icon || ''}
                          onChange={(e) => {
                            const url = e.target.value;
                            setFormData(prev => ({ ...prev, icon: url }));
                            if (url) {
                              setImagePreview(url);
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-slate-500">
                    Formats acceptés: JPEG, PNG, GIF, WebP (max 5MB)
                  </p>
                </div>

                <DialogFooter className="gap-2">
                  <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Création...
                      </>
                    ) : (
                      <>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Créer le thème
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
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Liste des thèmes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.isArray(themes) && themes.map(theme => (
            <Card key={theme.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {theme.icon ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200">
                        <img 
                          src={theme.icon} 
                          alt={theme.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-base">{theme.title}</CardTitle>
                      {theme.question_count !== undefined && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {theme.question_count} questions
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription className="text-sm">{theme.description}</CardDescription>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(theme)}
                    className="flex-1"
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteTheme(theme)}
                    className="flex-1"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
        ))}
      </div>

      {/* Dialog de modification (même formulaire que création) */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Modifier le thème</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-title">Titre *</Label>
              <Input
                id="edit-title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Image du thème (optionnel)</span>
              
              {imagePreview || formData.icon ? (
                <div className="space-y-2">
                  <div className="relative w-full max-w-xs mx-auto h-32 border-2 border-dashed border-slate-300 rounded-lg overflow-hidden">
                    <img 
                      src={imagePreview || formData.icon} 
                      alt="Aperçu" 
                      className="w-full h-full object-contain bg-slate-50"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      aria-label="Supprimer l'image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {selectedImage && !formData.icon && (
                    <Button
                      type="button"
                      onClick={handleUploadImage}
                      disabled={uploadingImage}
                      size="sm"
                      className="w-full"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Upload en cours...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Uploader l'image
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <p className="text-sm text-slate-600 mb-2">
                    Glissez une image ou cliquez pour sélectionner
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    disabled={isSubmitting}
                    className="cursor-pointer"
                  />
                </div>
              )}
              
              <p className="text-xs text-slate-500">
                Formats acceptés: JPEG, PNG, GIF, WebP (max 5MB)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-icon-url">Ou entrez une URL d'image</Label>
              <Input
                id="edit-icon-url"
                type="text"
                placeholder="https://..."
                value={formData.icon || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                disabled={isSubmitting || !!selectedImage}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Modification...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


