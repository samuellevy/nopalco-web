import React, { useEffect } from 'react';

import * as S from './setlist.styles';
import { SongList } from '@/presentation/components/songlist';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Setlist } from '@/domain/models/setlist';
import { LoadSetlistRequest } from '@/domain/usecases/setlists/load-setlist-request';
import { MessageCircle, Search, Edit2, Check, X } from 'lucide-react';
import { LoadAllSongsRequest } from '@/domain/usecases';
import { ModalSongsListComponent } from '@/presentation/components/modal-song-list/modal-song-list.component';
import { UpdateSetlistRequest } from '@/domain/usecases/setlists/update-setlist-request';

type SetlistProps = {
  loadSetlistRequest: LoadSetlistRequest;
  loadAllSongsRequest: LoadAllSongsRequest;
  updateSetlistRequest?: UpdateSetlistRequest;
};

export const SetlistPage: React.FC<SetlistProps> = ({
  loadSetlistRequest,
  loadAllSongsRequest,
  updateSetlistRequest,
}) => {
  const navigate = useNavigate();
  const { setlistId } = useParams<{ setlistId: string }>();
  const [searchParams] = useSearchParams();
  const position = searchParams.get('position') || null;

  const [loadingData, setLoadingData] = React.useState(true);
  const [modalSongsOpen, setModalSongsOpen] = React.useState(false);
  const [setlist, setSetlist] = React.useState<Setlist>({} as Setlist);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [editableItems, setEditableItems] = React.useState<Setlist['items']>([]);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);
  const [showSavedModal, setShowSavedModal] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

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

  const handleLinkClick = (songId: string, setlistId: string, key: string) => {
    navigate(`/songs/${songId}?setlist=${setlistId}&key=${encodeURIComponent(key)}`);
  };

  const handleCopySetlist = () => {
    // convert setlist to text
    let text = `Setlist: ${setlist.name}\nData: ${setlist.description}\n\n`;
    setlist.items
      ?.sort((a, b) => a.order - b.order)
      .forEach((item, index) => {
        if (item.song) {
          text += `${index + 1}. ${item.pureTitle ? item.pureTitle : item.song.name} - ${item.song.author} [${
            item.key
          }]\n`;
        } else {
          text += `${index + 1}. ${item.pureTitle} `;
          text += `[${item.key}]\n`;
        }
      });
    navigator.clipboard.writeText(text);
  };

  const handleClickSong = (songId: string) => {
    navigate(`/songs/${songId}`);
  };

  const handleGoToHome = () => {
    navigate(`/`);
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

  const handleUpdateItemKey = (index: number, newKey: string) => {
    const newItems = editableItems.map((item, idx) => (idx === index ? { ...item, key: newKey } : item));
    setEditableItems(newItems);
  };

  const handleSaveSetlist = async () => {
    setIsSaving(true);

    try {
      const updatedItems = editableItems.map((item, index) => ({
        pureTitle: item.pureTitle || item.song?.name || '',
        songId: item.song?.id || null,
        key: item.key,
        order: index + 1,
        id: item.id,
        song: item.song,
      }));

      const updatedSetlist = { ...setlist, items: updatedItems };
      await updateSetlistRequest?.execute(setlistId, updatedSetlist);

      setShowSavedModal(true);
      setTimeout(() => {
        setShowSavedModal(false);
        setIsEditMode(false);
        setSetlist({ ...setlist, items: updatedItems });
      }, 2000);
    } catch (error) {
      console.error('Erro ao salvar setlist:', error);
      alert('Erro ao salvar a setlist');
    } finally {
      setIsSaving(false);
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

  return (
    <>
      <S.Container>
        <S.Content>
          <S.Section>
            <S.HeaderText>
              <S.SectionTitle>{`${setlist.name} - ${setlist.description}`}</S.SectionTitle>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <MessageCircle onClick={() => handleCopySetlist()} style={{ cursor: 'pointer' }} />
                {!isEditMode ? (
                  <button
                    onClick={handleEditMode}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '8px 12px',
                      border: 'none',
                      borderRadius: '4px',
                      backgroundColor: '#008000',
                      color: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    <Edit2 size={16} />
                    Editar
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSaveSetlist}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '8px 12px',
                        border: 'none',
                        borderRadius: '4px',
                        backgroundColor: `${isSaving ? '#6c757d' : '#28a745'}`,
                        color: '#fff',
                        cursor: 'pointer',
                      }}
                      disabled={isSaving}
                    >
                      <Check size={16} />
                      {isSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '8px 12px',
                        border: 'none',
                        borderRadius: '4px',
                        backgroundColor: '#CF142b',
                        color: '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      <X size={16} />
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            </S.HeaderText>
            {setlist && (
              <S.SectionContent>
                {(isEditMode ? editableItems : setlist.items)
                  ?.sort((a, b) => (isEditMode ? 0 : a.order - b.order))
                  .map((item, index) => (
                    <React.Fragment key={item.id || index}>
                      {item.song && (
                        <SongList.Badge
                          id={item.song.id}
                          $variant="darkGray"
                          onClick={() => !isEditMode && handleLinkClick(item.song.id, setlistId, item.key)}
                          draggable={isEditMode}
                          onDragStart={() => isEditMode && handleDragStart(index)}
                          onDragOver={(e) => isEditMode && handleDragOver(index, e)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => isEditMode && handleDrop(index, e)}
                          style={{
                            opacity: isEditMode && draggedIndex === index ? 0.5 : 1,
                            backgroundColor: isEditMode && dragOverIndex === index ? '#f0f0f0' : undefined,
                            cursor: isEditMode ? 'grab' : 'pointer',
                            pointerEvents: isEditMode ? 'auto' : 'auto',
                          }}
                        >
                          <SongList.ASide>
                            <SongList.BadgeTitle>
                              {item.pureTitle ? item.pureTitle : item.song.name}
                            </SongList.BadgeTitle>
                            <SongList.BadgeSubTitle>{item.song.author}</SongList.BadgeSubTitle>
                          </SongList.ASide>
                          <SongList.ASide>
                            <S.BadgeKey>
                              {isEditMode && (
                                <input
                                  type="text"
                                  value={item.key}
                                  onChange={(e) => handleUpdateItemKey(index, e.target.value)}
                                  style={{
                                    padding: '4px 8px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                  }}
                                />
                              )}
                              {!isEditMode && item.key}
                            </S.BadgeKey>
                          </SongList.ASide>
                        </SongList.Badge>
                      )}
                      {!item.song && (
                        <SongList.Badge
                          $variant="disabled"
                          draggable={isEditMode}
                          onDragStart={() => isEditMode && handleDragStart(index)}
                          onDragOver={(e) => isEditMode && handleDragOver(index, e)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => isEditMode && handleDrop(index, e)}
                          style={{
                            opacity: isEditMode && draggedIndex === index ? 0.5 : 1,
                            backgroundColor: isEditMode && dragOverIndex === index ? '#f0f0f0' : undefined,
                            cursor: isEditMode ? 'grab' : 'default',
                          }}
                        >
                          <SongList.ASide>
                            <SongList.BadgeTitle>{item.pureTitle}</SongList.BadgeTitle>
                            {/* <SongList.BadgeTitle>{item.pureAuthor}</SongList.BadgeTitle> */}
                          </SongList.ASide>
                          {item.key && (
                            <SongList.ASide>
                              <S.BadgeKey>{item.key}</S.BadgeKey>
                            </SongList.ASide>
                          )}
                        </SongList.Badge>
                      )}
                    </React.Fragment>
                  ))}
                {/* 
            <SongList.Badge $variant="darkGray">
              <SongList.ASide>
                <SongList.Thumbnail>
                  <img src="https://images03.brasildefato.com.br/2e6b2c54d374ff3e215caf093a8ac7e4.jpeg" alt="" />
                </SongList.Thumbnail>
              </SongList.ASide>

              <SongList.ASide>
                <SongList.BadgeTitle>Banho de Folhas</SongList.BadgeTitle>
                <SongList.BadgeSubTitle>Luedji Luna</SongList.BadgeSubTitle>
              </SongList.ASide>
            </SongList.Badge> */}
              </S.SectionContent>
            )}
          </S.Section>
        </S.Content>

        <S.FlexRow>
          <S.SimpleButton onClick={handleGoToHome}>Voltar</S.SimpleButton>
        </S.FlexRow>
      </S.Container>

      <S.RightSideActions>
        <Search onClick={() => setModalSongsOpen(true)} />
      </S.RightSideActions>

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
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
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
