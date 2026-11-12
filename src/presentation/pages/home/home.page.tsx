import React from 'react';

import * as S from './home.styles';
import * as DS from '@/presentation/components/ds/ds.styles';
import { useNavigate } from 'react-router-dom';
import { LoadAllSetlistsRequest } from '@/domain/usecases/setlists/load-all-setlists-request';
import { Setlist } from '@/domain/models/setlist';
import { ModalSongsListComponent } from '@/presentation/components/modal-song-list/modal-song-list.component';
import { LoadAllSongsRequest } from '@/domain/usecases';
import FullscreenButtonComponent from '@/presentation/components/fullscreen-button/fullscreen-button.component';
import {
  Check,
  Edit2,
  GripVertical,
  MessageCircle,
  Search,
  X,
  MapPin,
  CalendarDays,
  ChevronRight,
  RotateCcw,
  Users,
} from 'lucide-react';
import { UserMenu } from '@/presentation/components/user-menu/user-menu.component';
import { useSession } from '@/main/config/session';

type HomeProps = {
  loadAllSetlistsRequest: LoadAllSetlistsRequest;
  loadAllSongsRequest: LoadAllSongsRequest;
};

export const HomePage: React.FC<HomeProps> = ({ loadAllSetlistsRequest, loadAllSongsRequest }) => {
  const navigate = useNavigate();
  const { isAuthenticated, account } = useSession();
  const canViewAllSetlists = isAuthenticated && account?.type === 'admin';
  const [loadingData, setLoadingData] = React.useState(true);
  const [setlists, setSetlists] = React.useState<Setlist[]>([]);
  const [modalSongsOpen, setModalSongsOpen] = React.useState(false);
  const [loadError, setLoadError] = React.useState(false);
  const [refresh, setRefresh] = React.useState(0);
  const [showAllSetlists, setShowAllSetlists] = React.useState(false);

  const [isEditMode, setIsEditMode] = React.useState(false);
  const [editableItems, setEditableItems] = React.useState<Setlist[]>([]);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);
  // const [showSavedModal, setShowSavedModal] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

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
    let active = true;
    setSetlists([]);
    setEditableItems([]);
    setIsEditMode(false);
    setLoadError(false);
    setLoadingData(isAuthenticated);
    if (!canViewAllSetlists) setShowAllSetlists(false);
    if (!isAuthenticated) {
      setShowAllSetlists(false);
      return;
    }
    loadAllSetlistsRequest.execute(canViewAllSetlists && showAllSetlists).then(
      (result) => {
        if (active) {
          setSetlists(result);
          setLoadingData(false);
        }
      },
      () => {
        if (active) {
          setLoadError(true);
          setLoadingData(false);
        }
      },
    );
    return () => {
      active = false;
    };
  }, [loadAllSetlistsRequest, isAuthenticated, account?.username, canViewAllSetlists, refresh, showAllSetlists]);

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
        <S.Title>Setlists</S.Title>
        <S.UserNavigation aria-label="Ações da home">
          <FullscreenButtonComponent />
          <S.Button
            type="button"
            title="Buscar músicas"
            aria-label="Buscar músicas"
            onClick={() => setModalSongsOpen(true)}
          >
            <Search aria-hidden="true" />
          </S.Button>
          <UserMenu inline />
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

      {canViewAllSetlists && (
        <S.FilterFlag>
          <input
            type="checkbox"
            checked={showAllSetlists}
            onChange={(event) => setShowAllSetlists(event.target.checked)}
          />
          Todos os setlists
        </S.FilterFlag>
      )}
      {!isAuthenticated && <S.Status>Você não está conectado.</S.Status>}
      {isAuthenticated && loadingData && <S.Status role="status">Carregando setlists...</S.Status>}
      {isAuthenticated && loadError && (
        <S.LoadState>
          <S.Error role="alert">Não foi possível carregar os setlists.</S.Error>
          <S.Button type="button" title="Tentar novamente" onClick={() => setRefresh((current) => current + 1)}>
            <RotateCcw size={18} /> Tentar novamente
          </S.Button>
        </S.LoadState>
      )}
      {isAuthenticated && !loadingData && !loadError && !itemsToRender.length && (
        <S.Status>{showAllSetlists ? 'Nenhum setlist.' : 'Nenhum setlist nos seus grupos.'}</S.Status>
      )}

      {isAuthenticated && (
        <S.SetlistList>
          <DS.CardList>
            {itemsToRender.map((setlist, index) => (
              <S.SetlistCard
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
                <S.SetlistNumber>{String(index + 1).padStart(2, '0')}</S.SetlistNumber>
                <DS.ItemContent>
                  <S.SetlistName>{setlist.name}</S.SetlistName>
                  <S.EventMeta>
                    {setlist.group && (
                      <S.MetaEntry>
                        <Users size={14} aria-hidden="true" />
                        {setlist.group.name}
                      </S.MetaEntry>
                    )}
                    <S.MetaEntry>
                      <MapPin size={14} aria-hidden="true" />
                      {setlist.address || 'Sem endereço'}
                    </S.MetaEntry>
                    {setlist.date && (
                      <S.MetaEntry>
                        <CalendarDays size={14} aria-hidden="true" />
                        <time>{formatDate(setlist.date)}</time>
                      </S.MetaEntry>
                    )}
                  </S.EventMeta>
                </DS.ItemContent>
                <ChevronRight size={20} aria-hidden="true" />
              </S.SetlistCard>
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
        </S.SetlistList>
      )}

      <ModalSongsListComponent
        loadAllSongsRequest={loadAllSongsRequest}
        modalSongsOpen={modalSongsOpen}
        setModalSongsOpen={setModalSongsOpen}
        handleClickSong={handleClickSong}
      />
    </S.Container>
  );
};
