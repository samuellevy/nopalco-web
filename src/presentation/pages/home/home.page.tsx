import React from 'react';

import * as S from './home.styles';
import * as DS from '@/presentation/components/ds/ds.styles';
import { BadgeComponent } from '@/presentation/components/badge';
// import { SongList } from '@/presentation/components/songlist';
import { useNavigate } from 'react-router-dom';
import { LoadAllSetlistsRequest } from '@/domain/usecases/setlists/load-all-setlists-request';
import { Setlist } from '@/domain/models/setlist';
import { ModalSongsListComponent } from '@/presentation/components/modal-song-list/modal-song-list.component';
import { LoadAllSongsRequest } from '@/domain/usecases';
import FullscreenButtonComponent from '@/presentation/components/fullscreen-button/fullscreen-button.component';
import { Check, Edit2, GripVertical, MessageCircle, Search, X } from 'lucide-react';

type HomeProps = {
  loadAllSetlistsRequest: LoadAllSetlistsRequest;
  loadAllSongsRequest: LoadAllSongsRequest;
};

export const HomePage: React.FC<HomeProps> = ({ loadAllSetlistsRequest, loadAllSongsRequest }) => {
  const navigate = useNavigate();
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
              {/* <DS.ItemMeta>
                {isEditMode ? (
                  <>
                    <DS.SingerSelect
                      value={item.singer?.id || ''}
                      onChange={(e) => handleUpdateItemSingerById(index, e.target.value)}
                    >
                      <option value="">Selecionar cantor</option>
                      {item.song?.singers?.map((singer) => (
                        <option key={singer.id} value={singer.id}>
                          {singer.name}
                        </option>
                      ))}
                    </DS.SingerSelect>
                    <DS.KeyInput
                      type="text"
                      value={item.key || ''}
                      onChange={(e) => handleUpdateItemKey(index, e.target.value)}
                      placeholder="Tom"
                    />
                  </>
                ) : (
                  <>
                    {item.singer && <DS.SingerBadge>{item.singer.name}</DS.SingerBadge>}
                    {item.key && <DS.KeyBadge>{item.key}</DS.KeyBadge>}
                  </>
                )}
              </DS.ItemMeta> */}
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

      <S.Content style={{ display: 'none' }}>
        {/* <S.Section>
          <S.SectionTitle>Próximos eventos</S.SectionTitle>

          <S.SectionContent>
            <BadgeComponent.Badge $variant="darkGray" onClick={() => handleLinkClick(`songs/`)}>
              <BadgeComponent.BadgeTitle>12/jan</BadgeComponent.BadgeTitle>
              <BadgeComponent.BadgeSubTitle>JoJoe</BadgeComponent.BadgeSubTitle>
            </BadgeComponent.Badge>
            <BadgeComponent.Badge $variant="darkGray" onClick={() => handleLinkClick(`songs-small/`)}>
              <BadgeComponent.BadgeTitle>12/jan [smartwatch]</BadgeComponent.BadgeTitle>
              <BadgeComponent.BadgeSubTitle>JoJoe</BadgeComponent.BadgeSubTitle>
            </BadgeComponent.Badge>
          </S.SectionContent>
        </S.Section> */}

        <S.Section>
          <S.SectionContent>
            {setlists
              // .sort((a, b) => {
              //   const [dayA, monthA, yearA] = a.description.split('/').map(Number);
              //   const [dayB, monthB, yearB] = b.description.split('/').map(Number);

              //   const dateA = new Date(yearA, monthA - 1, dayA).getTime();
              //   const dateB = new Date(yearB, monthB - 1, dayB).getTime();

              //   return dateA - dateB;
              // })
              // .reverse()
              .map((item) => (
                <BadgeComponent.Badge key={item.id} $variant="darkGray" onClick={() => handleLinkClick(item)}>
                  <BadgeComponent.BadgeTitle>{item.name}</BadgeComponent.BadgeTitle>
                  <BadgeComponent.BadgeSubTitle>
                    {item.address || 'sem endereço'} - {formatDate(item.date)}
                  </BadgeComponent.BadgeSubTitle>
                  <BadgeComponent.BadgeSubTitle>{item.description.replace(/\//g, '-')}</BadgeComponent.BadgeSubTitle>
                </BadgeComponent.Badge>
              ))}
          </S.SectionContent>
        </S.Section>

        {/* <S.Section>
          <S.SectionTitle>Músicas</S.SectionTitle>

          <S.SectionContent>
            <SongList.Badge $variant="darkGray" onClick={() => handleLinkClick('songs/123')}>
              <SongList.ASide>
                <SongList.Thumbnail>
                  <img
                    src="https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRGCu3ETf6NPxGijCEaIvANw6fyshVbUJs42fXNSqNI0P_AmBBL"
                    alt=""
                  />
                </SongList.Thumbnail>
              </SongList.ASide>
              <SongList.ASide>
                <SongList.BadgeTitle>Camarão que Dorme a Onda Leva</SongList.BadgeTitle>
                <SongList.BadgeSubTitle>Zeca Pagodinho</SongList.BadgeSubTitle>
              </SongList.ASide>
            </SongList.Badge>
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
            </SongList.Badge>
            <SongList.Badge $variant="darkGray">
              <SongList.ASide>
                <SongList.Thumbnail>
                  <img
                    src="https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcS4vODmRGvasDViGXfn6bzIL0ZdQi91cUSQVn0S6NllO67yowvV"
                    alt=""
                  />
                </SongList.Thumbnail>
              </SongList.ASide>

              <SongList.ASide>
                <SongList.BadgeTitle>Pé na Areia</SongList.BadgeTitle>
                <SongList.BadgeSubTitle>Diogo Nogueira</SongList.BadgeSubTitle>
              </SongList.ASide>
            </SongList.Badge>
            <SongList.Badge $variant="darkGray">
              <SongList.ASide>
                <SongList.Thumbnail>
                  <img
                    src="https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcR8V8tD6hJqi6QpYrXlOXKOStFqu-8lGIo6r3SN4ajZFGA8GQSE"
                    alt=""
                  />
                </SongList.Thumbnail>
              </SongList.ASide>

              <SongList.ASide>
                <SongList.BadgeTitle>O que é o amor?</SongList.BadgeTitle>
                <SongList.BadgeSubTitle>Arlindo Cruz</SongList.BadgeSubTitle>
              </SongList.ASide>
            </SongList.Badge>
          </S.SectionContent>
        </S.Section> */}
        <>v5.0.0</>
      </S.Content>

      <ModalSongsListComponent
        loadAllSongsRequest={loadAllSongsRequest}
        modalSongsOpen={modalSongsOpen}
        setModalSongsOpen={setModalSongsOpen}
        handleClickSong={handleClickSong}
      />
    </S.Container>
  );
};
