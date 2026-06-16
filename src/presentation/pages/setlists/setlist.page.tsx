import React, { useEffect } from 'react';

import * as S from './setlist.styles';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Setlist, SetlistItem } from '@/domain/models/setlist';
import { LoadSetlistRequest } from '@/domain/usecases/setlists/load-setlist-request';
import { MessageCircle, Edit2, Check, X, GripVertical, Upload, Download, Printer } from 'lucide-react';
import { LoadAllSongsRequest } from '@/domain/usecases';
import { ModalSongsListComponent } from '@/presentation/components/modal-song-list/modal-song-list.component';
import { UpdateSetlistRequest } from '@/domain/usecases/setlists/update-setlist-request';
import { SongComponent } from '@/presentation/components/song-component/song.component';
import { Song } from '@/domain/models';
import { UpdateSongRequest } from '@/domain/usecases/songs/update-song-request';

type SetlistProps = {
  loadSetlistRequest: LoadSetlistRequest;
  loadAllSongsRequest: LoadAllSongsRequest;
  updateSetlistRequest: UpdateSetlistRequest;
  updateSongRequest: UpdateSongRequest;
};

export const SetlistPage: React.FC<SetlistProps> = ({
  loadSetlistRequest,
  loadAllSongsRequest,
  updateSetlistRequest,
  updateSongRequest,
}) => {
  const navigate = useNavigate();
  const { setlistId } = useParams<{ setlistId: string }>();
  const [searchParams] = useSearchParams();
  const position = searchParams.get('position') || null;
  const songParam = searchParams.get('song') || null;
  const keyParam = searchParams.get('key') || null;

  const [loadingData, setLoadingData] = React.useState(true);
  const [modalSongsOpen, setModalSongsOpen] = React.useState(false);
  const [setlist, setSetlist] = React.useState<Setlist>({} as Setlist);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [editableItems, setEditableItems] = React.useState<Setlist['items']>([]);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);
  const [showSavedModal, setShowSavedModal] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const [setlistItemOpened, setSetlistItemOpened] = React.useState<SetlistItem | null>(null);

  console.log('update');

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
    // navigate(`/songs/${songId}?setlist=${setlistId}&key=${encodeURIComponent(key)}`);
    setSetlistItemOpened(setlistItem);
    // add ?songId=${song.id} to URL without reloading the page
    window.history.pushState({}, '', `/setlists/${setlistId}?song=${setlistItem.song?.id}&key=${setlistItem.key}`);
    // console.log(setlistItem.song);
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

  const handleClickSong = (songId: string) => {
    navigate(`/songs/${songId}`);
  };

  const handleEditMode = () => {
    setEditableItems([...setlist.items]);
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditableItems([]);
    setDraggedIndex(null);
    setDragOverIndex(null);
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
    setSetlistItemOpened(null);
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

      await updateSetlistRequest.execute(setlistId, { ...setlist, items: updatedItems });

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

  const handleNextSongButton = () => {
    if (!setlistItemOpened) return;

    const currentIndex = setlist.items?.findIndex((item) => item.id === setlistItemOpened.id);
    if (currentIndex === undefined || currentIndex === -1 || currentIndex === setlist.items!.length - 1) return;

    const nextItem = setlist.items![currentIndex + 1];
    if (nextItem.song) {
      handleLinkClick(nextItem);
    }
  };

  const handlePreviousSongButton = () => {
    if (!setlistItemOpened) return;

    const currentIndex = setlist.items?.findIndex((item) => item.id === setlistItemOpened.id);
    if (currentIndex === undefined || currentIndex <= 0) return;

    const previousItem = setlist.items![currentIndex - 1];
    if (previousItem.song) {
      handleLinkClick(previousItem);
    }
  };

  useEffect(() => {
    if (!loadingData) return;

    fetchLoadSetlistsRequest().then(() => {
      if (position) {
        const element = document.getElementById(position);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });

    //fetchLoadAllSongsRequest();
  }, [fetchLoadSetlistsRequest, loadingData, setlist, position]);

  React.useEffect(() => {
    if (setlist && setlist.name) {
      document.title = `${setlist.name} - NoPalco`;
    }
  }, [setlist]);

  useEffect(() => {
    if (setlist && songParam) {
      // console.log(songParam, `songParam`);
      const setlistItem = setlist.items?.find((item) => item.song?.id === songParam);

      if (setlistItem) {
        setSetlistItemOpened(setlistItem);
      }

      if (keyParam) {
        setSetlistItemOpened((prev) => (prev ? { ...prev, key: keyParam } : prev));
      }
      // else {
      //   // If song not found in setlist, ensure we are back to the main setlist view
      //   setSetlistItemOpened(null);
      //   window.history.pushState({}, '', `/setlists/${setlistId}`);
      // }
    }
  }, [songParam, keyParam, setlist]);

  React.useEffect(() => {
    if (!songParam) {
      setSetlistItemOpened(null);
    }
  }, [songParam]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const song = params.get('song');
      if (!song) {
        setSetlistItemOpened(null);
      } else if (setlist && setlist.items) {
        const setlistItem = setlist.items.find((item) => item.song?.id === song);
        setSetlistItemOpened(setlistItem || null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setlist]);

  return (
    <>
      {!setlistItemOpened && (
        <S.SetlistLayout>
          <S.Main>
            <S.PageHeader>
              <S.TitleGroup>
                <S.SetlistTitle>{setlist.name}</S.SetlistTitle>
                <S.SetlistSubtitle>{setlist.description}</S.SetlistSubtitle>
              </S.TitleGroup>
              <S.ActionGroup>
                <S.IconButton title="Copiar setlist" onClick={() => handleCopySetlist()}>
                  <MessageCircle size={18} />
                </S.IconButton>
                {!isEditMode ? (
                  <S.PrimaryButton onClick={handleEditMode}>
                    <Edit2 size={16} />
                    Editar
                  </S.PrimaryButton>
                ) : (
                  <>
                    <S.PrimaryButton onClick={handleSaveSetlist} disabled={isSaving}>
                      <Check size={16} />
                      {isSaving ? 'Salvando...' : 'Salvar'}
                    </S.PrimaryButton>
                    <S.DangerButton onClick={handleCancelEdit}>
                      <X size={16} />
                      Cancelar
                    </S.DangerButton>
                  </>
                )}
              </S.ActionGroup>
            </S.PageHeader>

            <S.SetlistGrid>
              <S.CardList>
                {itemsToRender.map((item, index) => (
                  <S.ItemCard
                    key={item.id || index}
                    type="button"
                    onClick={() => !isEditMode && item.song && handleLinkClick(item)}
                    draggable={isEditMode}
                    onDragStart={() => isEditMode && handleDragStart(index)}
                    onDragOver={(e) => isEditMode && handleDragOver(index, e)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => isEditMode && handleDrop(index, e)}
                    $isDragging={isEditMode && draggedIndex === index}
                    $isDragOver={isEditMode && dragOverIndex === index}
                    $linked={!!item.song}
                  >
                    {isEditMode && (
                      <S.ItemHandle>
                        <GripVertical size={18} />
                      </S.ItemHandle>
                    )}
                    <S.ItemNumber>{String(index + 1).padStart(2, '0')}</S.ItemNumber>
                    <S.ItemContent>
                      <S.ItemName>{item.pureTitle || item.song?.name || 'Sem título'}</S.ItemName>
                      {item.song?.author && <S.ItemArtist>{item.song.author}</S.ItemArtist>}
                    </S.ItemContent>
                    <S.ItemMeta>
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
      {setlistItemOpened && (
        <SongComponent
          data={
            {
              ...setlistItemOpened.song,
              content:
                typeof setlistItemOpened.song.content === 'string'
                  ? JSON.parse(setlistItemOpened.song.content)
                  : setlistItemOpened.song.content,
            } as Song
          }
          dataKey={setlistItemOpened.key ?? null}
          loadAllSongsRequest={loadAllSongsRequest}
          loadSetlistRequest={loadSetlistRequest}
          updateSongRequest={updateSongRequest}
          handleSetlistButton={() => backToSetlist()}
          handleNextSongButton={handleNextSongButton}
          handlePreviousSongButton={handlePreviousSongButton}
        />
      )}

      <ModalSongsListComponent
        loadAllSongsRequest={loadAllSongsRequest}
        modalSongsOpen={modalSongsOpen}
        setModalSongsOpen={setModalSongsOpen}
        handleClickSong={handleClickSong}
      />

      {showSavedModal && (
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
              backgroundColor: '#fff',
              padding: '30px',
              borderRadius: '8px',
              textAlign: 'center',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              maxWidth: '400px',
            }}
          >
            <Check size={48} color="#008000" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ margin: '0 0 10px', fontSize: '20px', fontWeight: 'bold' }}>Setlist salva com sucesso!</h2>
            <p style={{ margin: 0, color: '#666' }}>As alterações foram salvas na setlist.</p>
          </div>
        </div>
      )}
    </>
  );
};
