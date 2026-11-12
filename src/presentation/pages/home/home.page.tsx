import React from 'react';

import * as S from './home.styles';
import * as DS from '@/presentation/components/ds/ds.styles';
import { useNavigate } from 'react-router-dom';
import { LoadAllSetlistsRequest } from '@/domain/usecases/setlists/load-all-setlists-request';
import { Setlist } from '@/domain/models/setlist';
import { ModalSongsListComponent } from '@/presentation/components/modal-song-list/modal-song-list.component';
import { LoadAllSongsRequest } from '@/domain/usecases';
import FullscreenButtonComponent from '@/presentation/components/fullscreen-button/fullscreen-button.component';
import { Check, Edit2, GripVertical, MessageCircle, Search, X, LogIn, LogOut } from 'lucide-react';
import { clearAccount, useSession } from '@/main/config/session';

type HomeProps = {
  loadAllSetlistsRequest: LoadAllSetlistsRequest;
  loadAllSongsRequest: LoadAllSongsRequest;
};

export const HomePage: React.FC<HomeProps> = ({ loadAllSetlistsRequest, loadAllSongsRequest }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSession();
  const [loadingData, setLoadingData] = React.useState(true);
  const [setlists, setSetlists] = React.useState<Setlist[]>([]);
  const [modalSongsOpen, setModalSongsOpen] = React.useState(false);

  const [isEditMode, setIsEditMode] = React.useState(false);
  const [editableItems, setEditableItems] = React.useState<Setlist[]>([]);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);
  // const [showSavedModal, setShowSavedModal] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const fetchLoadAllSetlistsRequest = React.useCallback(async () => {
    setLoadingData(true);
    try {
      const loadAllSetlistsRequestResult = await loadAllSetlistsRequest.execute();
      setSetlists(loadAllSetlistsRequestResult);
      setLoadingData(false);
    } catch (error) {
      throw new Error(error as undefined);
    }
  }, [loadAllSetlistsRequest]);

  const itemsToRender = React.useMemo(() => {
    return (
      (isEditMode ? editableItems : setlists)
        ?.slice()
        .sort((a, b) => (isEditMode ? 0 : (a.order || 0) - (b.order || 0))) || []
    );
  }, [isEditMode, editableItems, setlists]);

  const handleLinkClick = (setlist: Setlist) => {
    navigate(`/setlists/${setlist.id}`, { state: { setlist } });
  };

  const handleClickSong = (songId: string) => {
    window.location.href = `/songs/${songId}`;
    setModalSongsOpen(false);
  };

  React.useEffect(() => {
    if (!loadingData) return;
    if (setlists && setlists.length > 0) return;

    fetchLoadAllSetlistsRequest();
  }, [fetchLoadAllSetlistsRequest, loadingData, setlists]);

  const formatDate = (dateString: any) => {
    if (!dateString) return '';
    const date = new Date(dateString.toString());
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year} ${hour}:${minute}`;
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (dropIndex: number, e: React.DragEvent) => {
    e.preventDefault();
    console.log('dropIndex', dropIndex);
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newItems = editableItems.map((item) => ({ ...item }));
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);

    setEditableItems(newItems);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleCopySetlist = () => {
    if (!setlists || setlists.length === 0) return;
    const setlistToCopy = setlists[0];
    navigator.clipboard.writeText(JSON.stringify(setlistToCopy));
    alert('Setlist copiado para a área de transferência!');
  };

  const handleEditMode = () => {
    setEditableItems([...setlists]);
    console.log('editableItems', [...setlists]);
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditableItems([]);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSaveSetlist = () => {
    setIsSaving(true);
  };

  return (
    <S.Container>
      <S.Header>
        {/* <S.Title>Olá, Samuel!</S.Title> */}
        <S.Title>&nbsp;</S.Title>
        <S.UserNavigation>
          <S.Button
            title={isAuthenticated ? 'Sair da conta' : 'Login'}
            onClick={() => (isAuthenticated ? clearAccount() : navigate('/login'))}
          >
            {isAuthenticated ? <LogOut size={18} /> : <LogIn size={18} />}
            {isAuthenticated ? 'Sair da conta' : 'Login'}
          </S.Button>
          <FullscreenButtonComponent />
          <S.Button onClick={() => setModalSongsOpen(true)}>
            <Search />
          </S.Button>
        </S.UserNavigation>

        <DS.ActionGroup style={{ display: 'none' }}>
          <DS.IconButton title="Copiar setlist" onClick={() => handleCopySetlist()}>
            <MessageCircle size={18} />
          </DS.IconButton>
          {!isEditMode ? (
            <DS.PrimaryButton onClick={handleEditMode}>
              <Edit2 size={16} />
              Editar
            </DS.PrimaryButton>
          ) : (
            <>
              <DS.PrimaryButton onClick={handleSaveSetlist} disabled={isSaving}>
                <Check size={16} />
                {isSaving ? 'Salvando...' : 'Salvar'}
              </DS.PrimaryButton>
              <DS.DangerButton onClick={handleCancelEdit}>
                <X size={16} />
                Cancelar
              </DS.DangerButton>
            </>
          )}
        </DS.ActionGroup>
      </S.Header>

      <DS.SetlistGrid>
        <DS.CardList>
          {itemsToRender.map((setlist, index) => (
            <DS.ItemCard
              key={setlist.id || index}
              type="button"
              onClick={() => !isEditMode && setlist && handleLinkClick(setlist)}
              draggable={isEditMode}
              onDragStart={() => isEditMode && handleDragStart(index)}
              onDragOver={(e) => isEditMode && handleDragOver(index, e)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => isEditMode && handleDrop(index, e)}
              $isDragging={isEditMode && draggedIndex === index}
              $isDragOver={isEditMode && dragOverIndex === index}
            >
              {isEditMode && (
                <DS.ItemHandle>
                  <GripVertical size={18} />
                </DS.ItemHandle>
              )}
              <DS.ItemNumber>{String(index + 1).padStart(2, '0')}</DS.ItemNumber>
              <DS.ItemContent>
                <DS.ItemName>{setlist.name}</DS.ItemName>
                {setlist.address || 'sem endereço'} - {formatDate(setlist.date)}
              </DS.ItemContent>
            </DS.ItemCard>
          ))}
        </DS.CardList>

        {/* <DS.Sidebar>
          <DS.InfoCard>
            <DS.CardTitle>Informações do Show</DS.CardTitle>
            <DS.InfoList>
              <DS.InfoItem>
                <span>Data</span>
                <strong>
                  {setlist.date
                    ? new Date(setlist.date).toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })
                    : '—'}
                </strong>
              </DS.InfoItem>
              <DS.InfoItem>
                <span>Local</span>
                <strong>{setlist.address || '—'}</strong>
              </DS.InfoItem>
              <DS.InfoItem>
                <span>Organizador</span>
                <strong>{setlist.description || '—'}</strong>
              </DS.InfoItem>
              <DS.InfoItem>
                <span>Total de músicas</span>
                <strong>{totalSongs}</strong>
              </DS.InfoItem>
              <DS.InfoItem>
                <span>Duração estimada</span>
                <strong>{totalDuration}</strong>
              </DS.InfoItem>
            </DS.InfoList>
          </DS.InfoCard>

          <DS.ActionCard style={{ display: 'none' }}>
            <DS.CardTitle>Ferramentas</DS.CardTitle>
            <DS.ToolList>
              <DS.ToolItem>
                <Upload size={16} />
                Reordenar músicas
              </DS.ToolItem>
              <DS.ToolItem>
                <Download size={16} />
                Importar setlist
              </DS.ToolItem>
              <DS.ToolItem>
                <Download size={16} />
                Exportar PDF
              </DS.ToolItem>
              <DS.ToolItem>
                <Printer size={16} />
                Imprimir
              </DS.ToolItem>
            </DS.ToolList>
          </DS.ActionCard>
        </DS.Sidebar> */}
      </DS.SetlistGrid>

      <ModalSongsListComponent
        loadAllSongsRequest={loadAllSongsRequest}
        modalSongsOpen={modalSongsOpen}
        setModalSongsOpen={setModalSongsOpen}
        handleClickSong={handleClickSong}
      />
    </S.Container>
  );
};
