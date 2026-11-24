import React, { useEffect } from 'react';

import * as S from './setlist.styles';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Setlist, SetlistItem } from '@/domain/models/setlist';
import { LoadSetlistRequest } from '@/domain/usecases/setlists/load-setlist-request';
import {
  MessageCircle,
  Edit2,
  Check,
  X,
  ArrowUp,
  ArrowLeftRight,
  GripVertical,
  Upload,
  Download,
  Printer,
  Search,
  Home,
  ListMusic,
  ChevronLeft,
  ChevronRight,
  Plus,
  Copy,
  Text,
  Wand2,
} from 'lucide-react';
import { LoadAllSongsRequest } from '@/domain/usecases';
import { ModalSongsListComponent } from '@/presentation/components/modal-song-list/modal-song-list.component';
import { UpdateSetlistRequest } from '@/domain/usecases/setlists/update-setlist-request';
import { SongComponent } from '@/presentation/components/song-component/song.component';
import { Song } from '@/domain/models';
import { UpdateSongRequest } from '@/domain/usecases/songs/update-song-request';
import FullscreenButtonComponent from '@/presentation/components/fullscreen-button/fullscreen-button.component';
import { NavigationButton } from '@/presentation/components/song-component/song.component.styles';
import { CreateSetlistRequest } from '@/domain/usecases/setlists/create-setlist-request';
import { getAccessToken, useSession } from '@/main/config/session';
import { UserMenu } from '@/presentation/components/user-menu/user-menu.component';
import { SetlistObservations } from '@/presentation/components/setlist-observations/setlist-observations.component';
import { saveSetlistObservations } from '@/data/services/setlist-observations-service';
import { SetlistGroupSelect } from '@/presentation/components/setlist-group-select/setlist-group-select.component';

type SetlistProps = {
  createSetlistRequest: CreateSetlistRequest;
  loadSetlistRequest: LoadSetlistRequest;
  loadAllSongsRequest: LoadAllSongsRequest;
  updateSetlistRequest: UpdateSetlistRequest;
  updateSongRequest: UpdateSongRequest;
};

export const SetlistPage: React.FC<SetlistProps> = ({
  createSetlistRequest,
  loadSetlistRequest,
  loadAllSongsRequest,
  updateSetlistRequest,
  updateSongRequest,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSession();
  const login = () => navigate('/login', { state: { from: window.location.pathname + window.location.search } });
  const { setlistId } = useParams<{ setlistId: string }>();
  const [searchParams] = useSearchParams();
  const position = searchParams.get('position') || null;

  const [loadingData, setLoadingData] = React.useState(true);
  const [modalSongsOpen, setModalSongsOpen] = React.useState(false);
  const [modalAddSongsOpen, setModalAddSongsOpen] = React.useState(false);
  const [replacingItemId, setReplacingItemId] = React.useState<string | null>(null);
  const [reorderTargetId, setReorderTargetId] = React.useState<string | null>(null);
  const lastItemTap = React.useRef<{ id: string; time: number } | null>(null);
  const itemTouch = React.useRef<{
    id: string;
    x: number;
    y: number;
    time: number;
    moved: boolean;
  } | null>(null);
  const [setlist, setSetlist] = React.useState<Setlist>({} as Setlist);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [editableItems, setEditableItems] = React.useState<Setlist['items']>([]);
  const [editableGroupId, setEditableGroupId] = React.useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);
  const [showSavedModal, setShowSavedModal] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [duplicateOpen, setDuplicateOpen] = React.useState(false);
  const [isDuplicating, setIsDuplicating] = React.useState(false);
  const [duplicateError, setDuplicateError] = React.useState('');
  const [duplicateDetails, setDuplicateDetails] = React.useState({
    name: '',
    description: '',
    address: '',
    date: '',
    groupId: '',
  });

  const [currentSongIndex, setCurrentSongIndex] = React.useState<number | null>(null);
  const [preloadedIndices, setPreloadedIndices] = React.useState<Set<number>>(new Set());
  const [lastLoadedIndex, setLastLoadedIndex] = React.useState<number | null>(null);
  const [lyricsMode, setLyricsMode] = React.useState(false);
  const [observationsMode, setObservationsMode] = React.useState(false);

  const changeLyricsMode = (active: React.SetStateAction<boolean>) => {
    setObservationsMode(false);
    setLyricsMode(active);
  };

  const handleSaveObservations = async (itemId: string, value: string) => {
    if (!setlistId) throw new Error('Missing setlist');
    const saved = await saveSetlistObservations(setlistId, itemId, value);
    setSetlist((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === itemId ? { ...item, observations: saved } : item)),
    }));
  };
  const [editingSongIndex, setEditingSongIndex] = React.useState<number | null>(null);

  const [showNewMomentoModal, setShowNewMomentoModal] = React.useState(false);
  const [newMomentoTitle, setNewMomentoTitle] = React.useState('');

  const fetchLoadSetlistsRequest = React.useCallback(async () => {
    setLoadingData(true);
    if (setlistId) {
      try {
        const loadSetlistsRequestResult = await loadSetlistRequest.execute(setlistId);
        setSetlist(loadSetlistsRequestResult);
        setLoadingData(false);
      } catch (error) {
        throw new Error(error as undefined);
      }
    }
  }, [loadSetlistRequest, setlistId]);

  const handleLinkClick = (setlistItem: SetlistItem) => {
    const index = setlist.items?.findIndex((item) => item.id === setlistItem.id);
    if (index !== undefined && index >= 0) {
      setCurrentSongIndex(index);
      setPreloadedIndices(new Set([index]));
      setLastLoadedIndex(index);
      window.history.pushState({}, '', `/setlists/${setlistId}?setlistItem=${setlistItem.id}&key=${setlistItem.key}`);
    }
  };

  const handleCopySetlist = () => {
    console.log('copy');
    // convert setlist to text
    let text = `Setlist: ${setlist.name}\nData: ${setlist.description}\n\n`;
    setlist.items
      ?.sort((a, b) => a.order - b.order)
      .forEach((item, index) => {
        if (item.song) {
          text += `${index + 1}. ${item.pureTitle ? item.pureTitle : item.song.name} - ${item.song.author} [${
            item.singer?.name || ''
          }${item.singer?.name ? ' ' : ''}${item.key}]\n`;
        } else {
          text += `${index + 1}. ${item.pureTitle} `;
          text += `[${item.singer?.name || ''} ${item.key}]\n`;
        }
      });
    navigator.clipboard.writeText(text);
  };

  const handleOpenDuplicate = () => {
    if (!getAccessToken()) {
      login();
      return;
    }
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setDuplicateDetails({
      name: `${setlist.name} (cópia)`,
      description: setlist.description || '',
      address: setlist.address || '',
      date: localDateTime,
      groupId: setlist.groupId || setlist.group?.id || '',
    });
    setDuplicateError('');
    setDuplicateOpen(true);
  };

  const handleDuplicateSetlist = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!getAccessToken()) {
      login();
      return;
    }
    if (isDuplicating) return;
    if (!duplicateDetails.name.trim()) {
      setDuplicateError('Informe o nome do novo setlist.');
      return;
    }

    setIsDuplicating(true);
    setDuplicateError('');
    try {
      const createdSetlist = await createSetlistRequest.execute({
        name: duplicateDetails.name.trim(),
        description: duplicateDetails.description.trim(),
        address: duplicateDetails.address.trim(),
        date: duplicateDetails.date ? new Date(duplicateDetails.date) : undefined,
        groupId: duplicateDetails.groupId || null,
        items: (setlist.items || [])
          .slice()
          .sort((first, second) => first.order - second.order)
          .map((item, index) => ({
            pureTitle: item.pureTitle || item.song?.name || '',
            songId: item.song?.id || null,
            order: String(index + 1),
            key: item.key || '',
            singerId: item.singer?.id,
          })),
      });
      if (!createdSetlist?.id) throw new Error('Missing created setlist ID');
      setDuplicateOpen(false);
      navigate(`/setlists/${createdSetlist.id}`);
    } catch {
      setDuplicateError('Não foi possível duplicar o setlist. Tente novamente.');
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleClickSong = (songId: string) => {
    const params = new URLSearchParams();
    if (setlistId) params.set('setlist', setlistId);
    navigate(`/songs/${songId}${params.size ? `?${params.toString()}` : ''}`);
  };

  const handleEditMode = () => {
    if (!getAccessToken()) {
      login();
      return;
    }
    setEditableItems([...setlist.items]);
    setEditableGroupId(setlist.groupId || setlist.group?.id || null);
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setModalAddSongsOpen(false);
    setReplacingItemId(null);
    setReorderTargetId(null);
    setEditableItems([]);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleAddSong = (song: Song) => {
    setEditableItems((items) =>
      replacingItemId
        ? items.map((item) =>
            item.id === replacingItemId
              ? {
                  ...item,
                  pureTitle: song.name,
                  pureAuthor: song.author,
                  song,
                  key: song.key || '',
                  singer: undefined,
                }
              : item,
          )
        : [
            ...items,
            {
              id: `song_${Date.now()}_${items.length}`,
              pureTitle: song.name,
              song,
              key: song.key || '',
              singer: undefined,
              order: items.length + 1,
            },
          ],
    );
    setModalAddSongsOpen(false);
    setReplacingItemId(null);
  };

  const handleRemoveItem = (itemId: string) => {
    if (isSaving) return;
    setEditableItems((items) => items.filter((item) => item.id !== itemId));
    if (replacingItemId === itemId) {
      setReplacingItemId(null);
      setModalAddSongsOpen(false);
    }
    lastItemTap.current = null;
    itemTouch.current = null;
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleEditableItemClick = (item: SetlistItem) => {
    if (isSaving) return;

    if (replacingItemId) {
      if (replacingItemId === item.id) {
        setReplacingItemId(null);
      } else {
        setReorderTargetId(item.id);
        lastItemTap.current = null;
      }
    } else {
      setReplacingItemId(item.id);
    }
  };

  const handleReorderItems = (action: 'move' | 'swap') => {
    if (replacingItemId && reorderTargetId) {
      setEditableItems((items) => {
        const selectedIndex = items.findIndex((entry) => entry.id === replacingItemId);
        const targetIndex = items.findIndex((entry) => entry.id === reorderTargetId);
        if (selectedIndex < 0 || targetIndex < 0 || selectedIndex === targetIndex) return items;

        const reorderedItems = [...items];
        if (action === 'swap') {
          [reorderedItems[selectedIndex], reorderedItems[targetIndex]] = [
            reorderedItems[targetIndex],
            reorderedItems[selectedIndex],
          ];
        } else {
          const [selectedItem] = reorderedItems.splice(selectedIndex, 1);
          const insertionIndex = reorderedItems.findIndex((entry) => entry.id === reorderTargetId);
          reorderedItems.splice(insertionIndex, 0, selectedItem);
        }
        return reorderedItems;
      });
    }
    setReplacingItemId(null);
    setReorderTargetId(null);
  };

  const handleEditableItemDoubleClick = (item: SetlistItem) => {
    if (isSaving) return;
    setReplacingItemId(item.id);
    setModalAddSongsOpen(true);
  };

  const handleItemTouchStart = (event: React.TouchEvent<HTMLButtonElement>, item: SetlistItem) => {
    if (!isEditMode || isSaving || event.touches.length !== 1) {
      itemTouch.current = null;
      lastItemTap.current = null;
      return;
    }
    const touch = event.touches[0];
    itemTouch.current = { id: item.id, x: touch.clientX, y: touch.clientY, time: Date.now(), moved: false };
  };

  const handleItemTouchMove = (event: React.TouchEvent<HTMLButtonElement>) => {
    const start = itemTouch.current;
    const touch = event.touches[0];
    if (start && touch && (Math.abs(touch.clientX - start.x) > 10 || Math.abs(touch.clientY - start.y) > 10)) {
      start.moved = true;
    }
  };

  const handleItemTouchEnd = (event: React.TouchEvent<HTMLButtonElement>, item: SetlistItem) => {
    const start = itemTouch.current;
    itemTouch.current = null;
    if (!isEditMode || isSaving || !start || start.id !== item.id) return;
    const touch = event.changedTouches[0];
    const now = Date.now();
    if (
      !touch ||
      start.moved ||
      now - start.time > 500 ||
      Math.abs(touch.clientX - start.x) > 10 ||
      Math.abs(touch.clientY - start.y) > 10
    ) {
      lastItemTap.current = null;
      return;
    }

    event.preventDefault();
    const previousTap = lastItemTap.current;
    if (previousTap?.id === item.id && now - previousTap.time <= 350) {
      lastItemTap.current = null;
      handleEditableItemDoubleClick(item);
    } else {
      lastItemTap.current = { id: item.id, time: now };
      handleEditableItemClick(item);
    }
  };

  useEffect(() => {
    lastItemTap.current = null;
    itemTouch.current = null;
  }, [isEditMode]);

  const handleAddNewMomento = () => {
    if (!newMomentoTitle.trim()) return;

    const newMomento: SetlistItem = {
      id: `momento_${Date.now()}`,
      pureTitle: newMomentoTitle,
      key: '',
      singer: undefined,
      song: null as any,
      order: editableItems.length + 1,
    };

    setEditableItems([...editableItems, newMomento]);
    setNewMomentoTitle('');
    setShowNewMomentoModal(false);
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

  const backToSetlist = () => {
    setCurrentSongIndex(null);
    setPreloadedIndices(new Set());
    setLastLoadedIndex(null);
    window.history.pushState({}, '', `/setlists/${setlistId}`);
  };

  const handleDrop = (dropIndex: number, e: React.DragEvent) => {
    e.preventDefault();
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

  const handleUpdateItemSingerById = (index: number, singerId: string) => {
    const newItems = editableItems.map((item, idx) => {
      if (idx === index) {
        const selectedSinger = item.song.singers?.find((s) => s.id === singerId);
        return { ...item, singer: selectedSinger, key: selectedSinger?.key || item.key };
      }
      return item;
    });
    setEditableItems(newItems);
  };

  const handleUpdateItemKey = (index: number, newKey: string) => {
    const newItems = editableItems.map((item, idx) => (idx === index ? { ...item, key: newKey } : item));
    setEditableItems(newItems);
  };

  const handleSaveSetlist = async () => {
    if (!getAccessToken()) {
      login();
      return;
    }
    if (!setlistId || !updateSetlistRequest) {
      return;
    }

    setIsSaving(true);

    try {
      const updatedItems = editableItems.map((item, index) => ({
        pureTitle: item.pureTitle || item.song?.name || '',
        songId: item.song?.id || '',
        key: item.key || '',
        singerId: item.singer?.id || '',
        order: index + 1,
      }));

      await updateSetlistRequest.execute(setlistId, { ...setlist, groupId: editableGroupId, items: updatedItems });

      setShowSavedModal(true);
      setTimeout(async () => {
        await fetchLoadSetlistsRequest();
        setShowSavedModal(false);
        setIsEditMode(false);
      }, 2000);
    } catch (error) {
      console.error('Erro ao salvar setlist:', error);
      alert('Erro ao salvar a setlist');
    } finally {
      setIsSaving(false);
    }
  };

  const itemsToRender = React.useMemo(() => {
    return (
      (isEditMode ? editableItems : setlist.items)
        ?.slice()
        .sort((a, b) => (isEditMode ? 0 : (a.order || 0) - (b.order || 0))) || []
    );
  }, [isEditMode, editableItems, setlist.items]);

  const totalSongs = (setlist.items || []).length;
  const totalDuration = React.useMemo(() => {
    const seconds = (setlist.items || []).reduce((sum, item) => {
      const duration = item.song?.duration;
      if (!duration) return sum;
      const parts = duration.split(':').map(Number);
      if (parts.length === 3) return sum + parts[0] * 3600 + parts[1] * 60 + parts[2];
      if (parts.length === 2) return sum + parts[0] * 60 + parts[1];
      return sum;
    }, 0);

    const pad = (value: number) => String(value).padStart(2, '0');
    if (!seconds) return '-';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(secs)}` : `${pad(minutes)}:${pad(secs)}`;
  }, [setlist.items]);

  const handleNextSongButton = (fromIndex: number) => {
    if (fromIndex === null || fromIndex === itemsToRender.length - 1) return;
    const nextIndex = fromIndex + 1;
    setCurrentSongIndex(nextIndex);
    setPreloadedIndices(new Set([nextIndex]));
    setLastLoadedIndex(nextIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviousSongButton = (fromIndex: number) => {
    if (fromIndex === null || fromIndex <= 0) return;
    const prevIndex = fromIndex - 1;
    setCurrentSongIndex(prevIndex);
    setPreloadedIndices(new Set([prevIndex]));
    setLastLoadedIndex(prevIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreloadNextSong = (fromIndex: number) => {
    if (fromIndex === null || fromIndex === itemsToRender.length - 1) return;
    const nextIndex = fromIndex + 1;
    setPreloadedIndices((prev) => new Set([...prev, nextIndex]));
    setLastLoadedIndex(nextIndex);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  useEffect(() => {
    fetchLoadSetlistsRequest().then(() => {
      if (position) {
        const element = document.getElementById(position);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  }, [fetchLoadSetlistsRequest, position]);

  React.useEffect(() => {
    if (!isAuthenticated) {
      setIsEditMode(false);
      setDuplicateOpen(false);
      setModalAddSongsOpen(false);
      setReplacingItemId(null);
      setReorderTargetId(null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (setlist && setlist.name) {
      document.title = `${setlist.name} - NoPalco`;
    }
  }, [setlist]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const song = params.get('song');
      if (!song) {
        setCurrentSongIndex(null);
        setPreloadedIndices(new Set());
      } else if (setlist && setlist.items) {
        const setlistItem = setlist.items.find((item) => item.song?.id === song);
        if (setlistItem) {
          const index = setlist.items.findIndex((item) => item.id === setlistItem.id);
          if (index >= 0) {
            setCurrentSongIndex(index);
            setPreloadedIndices(new Set([index]));
          }
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setlist]);

  // Initialize from URL query params when setlist loads
  useEffect(() => {
    if (!setlist || !setlist.items || loadingData) return;

    const params = new URLSearchParams(window.location.search);
    const setlistItemId = params.get('setlistItem') || params.get('song');

    if (!setlistItemId) {
      setCurrentSongIndex(null);
      setPreloadedIndices(new Set());
      setLastLoadedIndex(null);
      return;
    }

    // Try to find by setlistItem ID first, then by song ID for backward compatibility
    let targetItem = setlist.items.find((item) => item.id === setlistItemId);
    if (!targetItem) {
      targetItem = setlist.items.find((item) => item.song?.id === setlistItemId);
    }

    if (targetItem) {
      const index = setlist.items.findIndex((item) => item.id === targetItem!.id);
      if (index >= 0) {
        setCurrentSongIndex(index);
        setPreloadedIndices(new Set([index]));
        setLastLoadedIndex(index);
      }
    }
  }, [setlist, loadingData]);

  // Scroll to top when a song is selected
  useEffect(() => {
    if (currentSongIndex !== null) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentSongIndex]);

  return (
    <>
      {currentSongIndex === null && (
        <S.SetlistLayout>
          <S.Main>
            <S.PageHeader>
              <S.TitleGroup>
                <S.SetlistTitle>{setlist.name}</S.SetlistTitle>
                <S.SetlistSubtitle>{setlist.description}</S.SetlistSubtitle>
                <S.GroupName>{setlist.group?.name || 'Sem grupo'}</S.GroupName>
              </S.TitleGroup>
              <S.ActionGroup>
                <S.IconButton as="div">
                  <FullscreenButtonComponent />
                </S.IconButton>
                <S.IconButton
                  title="Buscar músicas"
                  aria-label="Buscar músicas"
                  onClick={() => setModalSongsOpen(true)}
                >
                  <Search size={18} />
                </S.IconButton>
                <UserMenu inline />
              </S.ActionGroup>
            </S.PageHeader>

            {isEditMode && (
              <SetlistGroupSelect
                value={editableGroupId}
                currentName={setlist.group?.name}
                disabled={isSaving}
                onChange={setEditableGroupId}
              />
            )}

            <S.SetlistGrid>
              <S.CardList>
                {itemsToRender.map((item, index) => (
                  <S.ItemRow key={item.id || index}>
                    <S.ItemCard
                      type="button"
                      $editing={isEditMode}
                      onClick={(event) => {
                        if (!isEditMode) {
                          handleLinkClick(item);
                        } else if (event.detail < 2 || replacingItemId !== item.id) {
                          handleEditableItemClick(item);
                        }
                      }}
                      onDoubleClick={() => isEditMode && handleEditableItemDoubleClick(item)}
                      onTouchStart={(event) => handleItemTouchStart(event, item)}
                      onTouchMove={handleItemTouchMove}
                      onTouchEnd={(event) => handleItemTouchEnd(event, item)}
                      onTouchCancel={() => {
                        itemTouch.current = null;
                        lastItemTap.current = null;
                      }}
                      aria-pressed={isEditMode ? replacingItemId === item.id : undefined}
                      onDragOver={(e) => isEditMode && handleDragOver(index, e)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => isEditMode && handleDrop(index, e)}
                      $isDragging={isEditMode && draggedIndex === index}
                      $isDragOver={isEditMode && dragOverIndex === index}
                      $isSelected={isEditMode && replacingItemId === item.id}
                      $linked={!!item.song}
                    >
                      <S.ItemNumber>
                        {isEditMode && (
                          <S.ItemHandle
                            draggable={!isSaving}
                            title="Arrastar para reordenar"
                            onDragStart={(event) => {
                              event.stopPropagation();
                              handleDragStart(index);
                            }}
                            onDragEnd={() => {
                              setDraggedIndex(null);
                              setDragOverIndex(null);
                            }}
                            onClick={(event) => event.stopPropagation()}
                            onDoubleClick={(event) => event.stopPropagation()}
                            onTouchStart={(event) => event.stopPropagation()}
                            onTouchEnd={(event) => event.stopPropagation()}
                          >
                            <GripVertical size={14} />
                          </S.ItemHandle>
                        )}
                        {String(index + 1).padStart(2, '0')}
                      </S.ItemNumber>
                      <S.ItemContent $editing={isEditMode}>
                        <S.ItemName>{item.pureTitle || item.song?.name || 'Sem título'}</S.ItemName>
                        {item.song?.author && <S.ItemArtist>{item.song.author}</S.ItemArtist>}
                      </S.ItemContent>
                      <S.ItemMeta
                        onClick={(event) => isEditMode && event.stopPropagation()}
                        onDoubleClick={(event) => isEditMode && event.stopPropagation()}
                        onTouchStart={(event) => isEditMode && event.stopPropagation()}
                        onTouchEnd={(event) => isEditMode && event.stopPropagation()}
                      >
                        {isEditMode ? (
                          <>
                            <S.SingerSelect
                              value={item.singer?.id || ''}
                              onChange={(e) => handleUpdateItemSingerById(index, e.target.value)}
                            >
                              <option value="">Selecionar cantor</option>
                              {item.song?.singers?.map((singer) => (
                                <option key={singer.id} value={singer.id}>
                                  {singer.name}
                                </option>
                              ))}
                            </S.SingerSelect>
                            <S.KeyInput
                              type="text"
                              value={item.key || ''}
                              onChange={(e) => handleUpdateItemKey(index, e.target.value)}
                              placeholder="Tom"
                            />
                          </>
                        ) : (
                          <>
                            {item.singer && <S.SingerBadge>{item.singer.name}</S.SingerBadge>}
                            {item.key && <S.KeyBadge>{item.key}</S.KeyBadge>}
                          </>
                        )}
                      </S.ItemMeta>
                    </S.ItemCard>
                    {isEditMode && (
                      <S.ReplaceItemButton
                        type="button"
                        title="Substituir música"
                        aria-label={`Substituir música ${index + 1}`}
                        disabled={isSaving}
                        onClick={() => handleEditableItemDoubleClick(item)}
                      >
                        <Edit2 size={18} aria-hidden="true" />
                      </S.ReplaceItemButton>
                    )}
                    {isEditMode && (
                      <S.RemoveItemButton
                        type="button"
                        title={`Remover ${item.pureTitle || item.song?.name || 'item'} do setlist`}
                        aria-label={`Remover música ${index + 1} do setlist`}
                        disabled={isSaving}
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <X size={18} aria-hidden="true" />
                      </S.RemoveItemButton>
                    )}
                  </S.ItemRow>
                ))}
              </S.CardList>

              <S.Sidebar>
                <S.InfoCard>
                  <S.CardTitle>Informações do Show</S.CardTitle>
                  <S.InfoList>
                    <S.InfoItem>
                      <span>Data</span>
                      <strong>
                        {setlist.date
                          ? new Date(setlist.date).toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })
                          : '—'}
                      </strong>
                    </S.InfoItem>
                    <S.InfoItem>
                      <span>Local</span>
                      <strong>{setlist.address || '—'}</strong>
                    </S.InfoItem>
                    <S.InfoItem>
                      <span>Organizador</span>
                      <strong>{setlist.description || '—'}</strong>
                    </S.InfoItem>
                    <S.InfoItem>
                      <span>Total de músicas</span>
                      <strong>{totalSongs}</strong>
                    </S.InfoItem>
                    <S.InfoItem>
                      <span>Duração estimada</span>
                      <strong>{totalDuration}</strong>
                    </S.InfoItem>
                  </S.InfoList>
                </S.InfoCard>

                <S.ActionCard style={{ display: 'none' }}>
                  <S.CardTitle>Ferramentas</S.CardTitle>
                  <S.ToolList>
                    <S.ToolItem>
                      <Upload size={16} />
                      Reordenar músicas
                    </S.ToolItem>
                    <S.ToolItem>
                      <Download size={16} />
                      Importar setlist
                    </S.ToolItem>
                    <S.ToolItem>
                      <Download size={16} />
                      Exportar PDF
                    </S.ToolItem>
                    <S.ToolItem>
                      <Printer size={16} />
                      Imprimir
                    </S.ToolItem>
                  </S.ToolList>
                </S.ActionCard>
              </S.Sidebar>
            </S.SetlistGrid>
          </S.Main>
        </S.SetlistLayout>
      )}
      {currentSongIndex !== null && (
        <div style={{ width: '100%', overflow: 'auto', paddingBottom: '140px' }}>
          {currentSongIndex !== null && itemsToRender[currentSongIndex] && (
            <div
              key={`song-${currentSongIndex}`}
              style={{
                width: '100%',
              }}
            >
              {itemsToRender[currentSongIndex].song ? (
                <SongComponent
                  data={itemsToRender[currentSongIndex].song}
                  dataKey={itemsToRender[currentSongIndex].key ?? null}
                  conversationGroupId={setlist.groupId || setlist.group?.id || null}
                  conversationGroupName={setlist.group?.name}
                  lyricsMode={lyricsMode}
                  onLyricsModeChange={changeLyricsMode}
                  observationsMode={observationsMode}
                  onObservationsModeChange={setObservationsMode}
                  observations={itemsToRender[currentSongIndex].observations}
                  onSaveObservations={(value) => handleSaveObservations(itemsToRender[currentSongIndex].id, value)}
                  editMode={editingSongIndex === currentSongIndex}
                  onEditModeChange={(active) => setEditingSongIndex(active ? currentSongIndex : null)}
                  setlistSongList={setlist.items}
                  handleSelectSetlistItem={handleLinkClick}
                  loadAllSongsRequest={loadAllSongsRequest}
                  loadSetlistRequest={loadSetlistRequest}
                  updateSongRequest={updateSongRequest}
                  handleSetlistButton={() => backToSetlist()}
                  handleNextSongButton={() => handleNextSongButton(currentSongIndex)}
                  handlePreviousSongButton={() => handlePreviousSongButton(currentSongIndex)}
                  handlePreloadNextSongButton={() => handlePreloadNextSong(currentSongIndex)}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#0f1117',
                    color: '#f8fafc',
                    padding: '2rem',
                  }}
                >
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'left', marginBottom: '30px' }}>
                    {itemsToRender[currentSongIndex]?.pureTitle || 'Sem título'}
                  </div>
                  {observationsMode && (
                    <SetlistObservations
                      observations={itemsToRender[currentSongIndex].observations}
                      onSave={(value) => handleSaveObservations(itemsToRender[currentSongIndex].id, value)}
                    />
                  )}
                  <div style={{ display: observationsMode ? 'none' : 'flex', gap: '10px' }}>
                    {currentSongIndex > 0 && (
                      <button
                        onClick={() => handlePreviousSongButton(currentSongIndex)}
                        style={{
                          padding: '10px 20px',
                          fontSize: '16px',
                          cursor: 'pointer',
                          backgroundColor: '#8B5CF6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                        }}
                      >
                        Anterior
                      </button>
                    )}
                    {currentSongIndex < itemsToRender.length - 1 && (
                      <>
                        <button
                          onClick={() => handleNextSongButton(currentSongIndex)}
                          style={{
                            padding: '10px 20px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            backgroundColor: '#8B5CF6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                          }}
                        >
                          Próxima
                        </button>
                        <button
                          onClick={() => handlePreloadNextSong(currentSongIndex)}
                          style={{
                            padding: '10px 20px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            backgroundColor: '#8B5CF6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                          }}
                        >
                          + Carregar
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => backToSetlist()}
                      style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        backgroundColor: '#666',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                      }}
                    >
                      Voltar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {Array.from(preloadedIndices)
            .filter((idx) => idx !== currentSongIndex)
            .sort((a, b) => a - b)
            .map((index) => {
              const item = itemsToRender[index];
              return (
                <div
                  id={`preload-song-${index}`}
                  key={`song-${index}`}
                  style={{
                    width: '100%',
                    borderTop: '2px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {item?.song ? (
                    <SongComponent
                      data={item.song}
                      dataKey={item.key ?? null}
                      conversationGroupId={setlist.groupId || setlist.group?.id || null}
                      conversationGroupName={setlist.group?.name}
                      lyricsMode={lyricsMode}
                      onLyricsModeChange={changeLyricsMode}
                      observationsMode={observationsMode}
                      onObservationsModeChange={setObservationsMode}
                      observations={item.observations}
                      onSaveObservations={(value) => handleSaveObservations(item.id, value)}
                      editMode={editingSongIndex === index}
                      onEditModeChange={(active) => setEditingSongIndex(active ? index : null)}
                      setlistSongList={setlist.items}
                      handleSelectSetlistItem={handleLinkClick}
                      loadAllSongsRequest={loadAllSongsRequest}
                      loadSetlistRequest={loadSetlistRequest}
                      updateSongRequest={updateSongRequest}
                      handleSetlistButton={() => backToSetlist()}
                      handleNextSongButton={() => handleNextSongButton(index)}
                      handlePreviousSongButton={() => handlePreviousSongButton(index)}
                      handlePreloadNextSongButton={() => handlePreloadNextSong(index)}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: '#0f1117',
                        color: '#f8fafc',
                        padding: '2rem',
                      }}
                    >
                      <div style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'left', marginBottom: '30px' }}>
                        {item?.pureTitle || 'Sem título'}
                      </div>
                      {observationsMode && (
                        <SetlistObservations
                          observations={item.observations}
                          onSave={(value) => handleSaveObservations(item.id, value)}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {currentSongIndex === null && (
        <S.SetlistNavigation aria-label="Navegacao do setlist">
          <NavigationButton type="button" onClick={handleBackToHome}>
            <Home size={22} aria-hidden="true" />
            <span>Home</span>
          </NavigationButton>
          <NavigationButton
            type="button"
            title="Copiar setlist"
            aria-label="Copiar setlist"
            onClick={handleCopySetlist}
          >
            <MessageCircle size={22} aria-hidden="true" />
            <span>Copiar</span>
          </NavigationButton>
          {isAuthenticated &&
            (!isEditMode ? (
              <>
                <NavigationButton type="button" onClick={handleEditMode} title="Editar">
                  <Edit2 size={22} aria-hidden="true" />
                  <span>Editar</span>
                </NavigationButton>
                <NavigationButton type="button" onClick={handleOpenDuplicate} disabled={loadingData} title="Duplicar">
                  <Copy size={22} aria-hidden="true" />
                  <span>Duplicar</span>
                </NavigationButton>
              </>
            ) : (
              <>
                <NavigationButton
                  type="button"
                  onClick={() => {
                    setReplacingItemId(null);
                    setModalAddSongsOpen(true);
                  }}
                  disabled={isSaving}
                  title="Adicionar música"
                  aria-label="Adicionar música"
                >
                  <Plus size={22} aria-hidden="true" />
                  <span>Música</span>
                </NavigationButton>
                <NavigationButton
                  type="button"
                  onClick={() => setShowNewMomentoModal(true)}
                  title="Adicionar momento"
                  aria-label="Adicionar momento"
                >
                  <ListMusic size={22} aria-hidden="true" />
                  <span>Momento</span>
                </NavigationButton>
                <S.EditNavigationButton
                  $intent="save"
                  type="button"
                  onClick={handleSaveSetlist}
                  disabled={isSaving}
                  title="Salvar"
                >
                  <Check size={22} aria-hidden="true" />
                  <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
                </S.EditNavigationButton>
                <S.EditNavigationButton $intent="cancel" type="button" onClick={handleCancelEdit} title="Cancelar">
                  <X size={22} aria-hidden="true" />
                  <span>Cancelar</span>
                </S.EditNavigationButton>
              </>
            ))}
        </S.SetlistNavigation>
      )}

      {isEditMode && modalAddSongsOpen && (
        <ModalSongsListComponent
          loadAllSongsRequest={loadAllSongsRequest}
          modalSongsOpen={modalAddSongsOpen}
          setModalSongsOpen={(open) => {
            setModalAddSongsOpen(open);
            setReplacingItemId(null);
          }}
          handleClickSong={handleClickSong}
          onSelectSong={handleAddSong}
          ariaLabel={replacingItemId ? 'Substituir música do setlist' : 'Adicionar música ao setlist'}
        />
      )}

      <ModalSongsListComponent
        loadAllSongsRequest={loadAllSongsRequest}
        modalSongsOpen={modalSongsOpen}
        setModalSongsOpen={setModalSongsOpen}
        handleClickSong={handleClickSong}
      />

      {isEditMode && reorderTargetId && (
        <S.DuplicateOverlay
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setReorderTargetId(null);
              setReplacingItemId(null);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setReorderTargetId(null);
              setReplacingItemId(null);
            }
          }}
        >
          <S.DuplicateDialog as="div" role="dialog" aria-modal="true" aria-labelledby="reorder-title">
            <S.DuplicateTitle id="reorder-title">Reordenar músicas</S.DuplicateTitle>
            <p style={{ overflowWrap: 'anywhere' }}>
              {editableItems.find((item) => item.id === replacingItemId)?.pureTitle ||
                editableItems.find((item) => item.id === replacingItemId)?.song?.name ||
                'Sem título'}{' '}
              →{' '}
              {editableItems.find((item) => item.id === reorderTargetId)?.pureTitle ||
                editableItems.find((item) => item.id === reorderTargetId)?.song?.name ||
                'Sem título'}
            </p>
            <S.DuplicateActions>
              <S.Button type="button" autoFocus onClick={() => handleReorderItems('move')}>
                <ArrowUp size={16} /> Colocar antes
              </S.Button>
              <S.Button type="button" onClick={() => handleReorderItems('swap')}>
                <ArrowLeftRight size={16} /> Trocar posições
              </S.Button>
              <S.Button
                type="button"
                onClick={() => {
                  setReorderTargetId(null);
                  setReplacingItemId(null);
                }}
              >
                <X size={16} /> Cancelar
              </S.Button>
            </S.DuplicateActions>
          </S.DuplicateDialog>
        </S.DuplicateOverlay>
      )}

      {duplicateOpen && (
        <S.DuplicateOverlay
          onClick={(event) => {
            if (event.target === event.currentTarget && !isDuplicating) setDuplicateOpen(false);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && !isDuplicating) setDuplicateOpen(false);
          }}
        >
          <S.DuplicateDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="duplicate-setlist-title"
            aria-busy={isDuplicating}
            onSubmit={handleDuplicateSetlist}
          >
            <S.DuplicateTitle id="duplicate-setlist-title">Duplicar setlist</S.DuplicateTitle>
            <S.DuplicateFields disabled={isDuplicating}>
              <SetlistGroupSelect
                label="Grupo do novo setlist"
                value={duplicateDetails.groupId || null}
                currentName={setlist.group?.name}
                disabled={isDuplicating}
                onChange={(groupId) => setDuplicateDetails({ ...duplicateDetails, groupId: groupId || '' })}
              />
              <S.DuplicateField>
                Nome
                <input
                  autoFocus
                  required
                  value={duplicateDetails.name}
                  onChange={(event) => setDuplicateDetails({ ...duplicateDetails, name: event.target.value })}
                />
              </S.DuplicateField>
              <S.DuplicateField>
                Descrição
                <input
                  value={duplicateDetails.description}
                  onChange={(event) => setDuplicateDetails({ ...duplicateDetails, description: event.target.value })}
                />
              </S.DuplicateField>
              <S.DuplicateField>
                Data e hora
                <input
                  type="datetime-local"
                  value={duplicateDetails.date}
                  onChange={(event) => setDuplicateDetails({ ...duplicateDetails, date: event.target.value })}
                />
              </S.DuplicateField>
              <S.DuplicateField>
                Local
                <input
                  value={duplicateDetails.address}
                  onChange={(event) => setDuplicateDetails({ ...duplicateDetails, address: event.target.value })}
                />
              </S.DuplicateField>
              {duplicateError && <p role="alert">{duplicateError}</p>}
              <S.DuplicateActions>
                <S.Button type="button" onClick={() => setDuplicateOpen(false)}>
                  <X size={16} /> Cancelar
                </S.Button>
                <S.PrimaryButton type="submit">
                  <Copy size={16} /> {isDuplicating ? 'Duplicando...' : 'Criar cópia'}
                </S.PrimaryButton>
              </S.DuplicateActions>
            </S.DuplicateFields>
          </S.DuplicateDialog>
        </S.DuplicateOverlay>
      )}

      {showSavedModal && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: '#171b26',
              color: '#f8fafc',
              border: '1px solid rgba(167, 139, 250, 0.3)',
              borderTop: '3px solid #a78bfa',
              padding: '30px',
              borderRadius: '8px',
              textAlign: 'center',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.35)',
              width: '100%',
              maxWidth: '400px',
            }}
          >
            <Check size={48} color="#a78bfa" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ margin: '0 0 10px', fontSize: '20px', fontWeight: 'bold' }}>Setlist salva com sucesso!</h2>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px', fontWeight: 400, lineHeight: 1.5 }}>
              As alterações foram salvas na setlist.
            </p>
          </div>
        </div>
      )}

      {showNewMomentoModal && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: '#1f2937',
              padding: '30px',
              borderRadius: '8px',
              textAlign: 'center',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              maxWidth: '400px',
              color: '#fff',
            }}
          >
            <h2 style={{ margin: '0 0 20px', fontSize: '20px', fontWeight: 'bold' }}>Adicionar Novo Momento</h2>
            <input
              type="text"
              placeholder="Nome do momento"
              value={newMomentoTitle}
              onChange={(e) => setNewMomentoTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddNewMomento()}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '20px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backgroundColor: '#0f1117',
                color: '#fff',
                boxSizing: 'border-box',
                fontSize: '16px',
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={handleAddNewMomento}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#8B5CF6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}
              >
                Adicionar
              </button>
              <button
                onClick={() => {
                  setShowNewMomentoModal(false);
                  setNewMomentoTitle('');
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6b7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {currentSongIndex !== null && (
        <S.SetlistNavigation aria-label="Navegacao das musicas do setlist">
          <NavigationButton type="button" onClick={() => backToSetlist()}>
            <ListMusic size={22} aria-hidden="true" />
            <span>Setlist</span>
          </NavigationButton>
          {lastLoadedIndex !== null && lastLoadedIndex > 0 && (
            <NavigationButton type="button" onClick={() => handlePreviousSongButton(lastLoadedIndex)}>
              <ChevronLeft size={22} aria-hidden="true" />
              <span>Anterior</span>
            </NavigationButton>
          )}
          {lastLoadedIndex !== null && lastLoadedIndex < itemsToRender.length - 1 && (
            <NavigationButton type="button" onClick={() => handleNextSongButton(lastLoadedIndex)}>
              <ChevronRight size={22} aria-hidden="true" />
              <span>Próxima</span>
            </NavigationButton>
          )}
          {lastLoadedIndex !== null && lastLoadedIndex < itemsToRender.length - 1 && (
            <NavigationButton type="button" onClick={() => handlePreloadNextSong(lastLoadedIndex)}>
              <Plus size={22} aria-hidden="true" />
              <span>Carregar</span>
            </NavigationButton>
          )}
          <NavigationButton
            type="button"
            title="Letras"
            aria-pressed={lyricsMode}
            onClick={() => changeLyricsMode((active) => !active)}
          >
            <Text size={22} aria-hidden="true" />
            <span>Letras</span>
          </NavigationButton>
          <NavigationButton
            type="button"
            title="Observações"
            aria-pressed={observationsMode}
            onClick={() => {
              setLyricsMode(false);
              setObservationsMode((active) => !active);
            }}
          >
            <Wand2 size={22} aria-hidden="true" />
            <span>Obs</span>
          </NavigationButton>
        </S.SetlistNavigation>
      )}
    </>
  );
};
