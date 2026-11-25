import React from 'react';

import * as S from './setlist-create.styles';
import { LoadAllSongsRequest } from '@/domain/usecases';
import { Song } from '@/domain/models';
import Loader from '@/presentation/components/loader/loader';
import { ArrowDownUp, Check, Home, Save, X } from 'lucide-react';
import { CreateSetlistDTO, CreateSetlistRequest } from '@/domain/usecases/setlists/create-setlist-request';
import { SetlistGroupSelect } from '@/presentation/components/setlist-group-select/setlist-group-select.component';

type Props = {
  loadAllSongsRequest: LoadAllSongsRequest;
  createSetlistRequest: CreateSetlistRequest;
};

export const SetlistCreatePage: React.FC<Props> = ({ loadAllSongsRequest, createSetlistRequest }) => {
  const [loadingData, setLoadingData] = React.useState(true);
  const [songList, setSongList] = React.useState<Song[]>([]);
  const [originalList, setSongOriginalList] = React.useState<Song[]>([]);
  const [selectedSongs, setSelectedSongs] = React.useState<Song[]>([]);
  const [momentName, setMomentName] = React.useState<string>('');
  const [eventName, setEventName] = React.useState<string>('');
  const [eventDescription, setEventDescription] = React.useState<string>('');
  const [eventDate, setEventDate] = React.useState<string>('');
  const [eventAddress, setEventAddress] = React.useState<string>('');
  const [groupId, setGroupId] = React.useState<string | null>(null);
  const [sendingData, setSendingData] = React.useState(false);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  function gerarHashCrypto(tamanho = 16): string {
    const array = new Uint8Array(tamanho);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  const handleClickSong = (song: Song) => {
    console.log(song);
    if (selectedSongs.find((songItem) => songItem.id === song.id)) {
      setSelectedSongs((prevState) => [...prevState.filter((songItem) => songItem.id !== song.id)]);
    } else {
      setSelectedSongs((prevState) => [...prevState, song]);
    }
  };

  const updateKeyOnSelectedSong = (e: React.ChangeEvent<HTMLInputElement>, songIndex: number) => {
    const tmpSelectedSongs = [
      ...selectedSongs.map((songItem, index) =>
        index === songIndex ? { ...songItem, key: e.target.value } : { ...songItem },
      ),
    ];
    setSelectedSongs(tmpSelectedSongs);
    console.log(selectedSongs);
    console.log(tmpSelectedSongs);
  };

  const fetchLoadAllSongsRequest = React.useCallback(async () => {
    setLoadingData(true);
    try {
      const loadAllSongsRequestResult = await loadAllSongsRequest.execute();
      setSongList(loadAllSongsRequestResult.songs);
      setSongOriginalList(loadAllSongsRequestResult.songs);
      setLoadingData(false);
    } catch (error) {
      throw new Error(error as undefined);
    }
  }, [loadAllSongsRequest]);

  const handleFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const filteredSongList = originalList.filter(
      (song) =>
        song.name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .includes(value.toLowerCase()) ||
        (song.author ?? '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .includes(value.toLowerCase()),
    );
    setSongList(filteredSongList);
  };

  const handleCreateMoment = () => {
    setSelectedSongs((prevState) => [
      ...prevState,
      {
        id: gerarHashCrypto(),
        name: momentName,
        key: '',
        author: '',
        bpm: '',
        new: true,
      },
    ]);
    setMomentName('');
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

    const newSelectedSongs = [...selectedSongs];
    const draggedSong = newSelectedSongs[draggedIndex];
    newSelectedSongs.splice(draggedIndex, 1);
    newSelectedSongs.splice(dropIndex, 0, draggedSong);

    setSelectedSongs(newSelectedSongs);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleCreateSetlist = async () => {
    setSendingData(true);
    const payload: CreateSetlistDTO = {
      name: eventName,
      description: eventDescription,
      address: eventAddress,
      groupId,
      date: eventDate ? new Date(eventDate) : undefined,
      items: selectedSongs.map((song, index) => ({
        pureTitle: song.name,
        songId: song.new ? null : song.id ?? null,
        order: `${index + 1}`,
        key: song.key ?? '',
      })),
    };

    console.log(payload, 'payload');

    try {
      const createSetlistResponse = await createSetlistRequest.execute(payload);
      alert('Setlist criada com sucesso!');
      window.location.href = `/setlists/${createSetlistResponse.id}`;
    } catch (err) {
      console.error(err);
    } finally {
      setSendingData(false);
    }

    console.log({
      eventName,
      eventDescription,
      selectedSongs,
    });
  };

  React.useEffect(() => {
    if (!loadingData) return;
    if (songList && songList.length > 0) return;

    fetchLoadAllSongsRequest();
  }, [fetchLoadAllSongsRequest, loadingData, songList]);

  return loadingData ? (
    <S.Container>
      <Loader />
    </S.Container>
  ) : (
    <S.Container>
      {/* <S.Header>
        <S.Title></S.Title>
        <S.UserNavigation>
          <S.UserAvatar src="/assets/avatar.jpg" />
        </S.UserNavigation>
      </S.Header> */}

      <S.Content>
        <S.SectionHeaderRow>
          <S.InputGroup>
            <label>Nome do evento</label>
            <S.FormInputHeader
              placeholder="Nome do evento"
              onChange={(e) => setEventName(e.target.value)}
              value={eventName}
            />
          </S.InputGroup>
          <S.InputGroup>
            <label>Descrição</label>
            <S.FormInputHeader
              placeholder="Descrição do evento"
              onChange={(e) => setEventDescription(e.target.value)}
              value={eventDescription}
            />
          </S.InputGroup>
          <S.InputGroup>
            <label>Data do evento</label>
            <S.FormInputHeader onChange={(e) => setEventDate(e.target.value)} value={eventDate} type="datetime-local" />
          </S.InputGroup>
          <S.InputGroup>
            <label>Endereço</label>
            <S.FormInputHeader
              placeholder="Rua exemplo, 123"
              onChange={(e) => setEventAddress(e.target.value)}
              value={eventAddress}
            />
          </S.InputGroup>
          <S.InputGroup>
            <SetlistGroupSelect value={groupId} onChange={setGroupId} disabled={sendingData} />
          </S.InputGroup>
        </S.SectionHeaderRow>
        <S.MomentForm>
          <S.InputGroup>
            <label htmlFor="moment-name">Adicionar momento não linkável</label>
            <S.FormInput
              id="moment-name"
              name="moment-name"
              placeholder="Escreva aqui"
              onChange={(e) => setMomentName(e.target.value)}
              value={momentName}
            />
          </S.InputGroup>
          <S.MomentButton
            type="button"
            onClick={handleCreateMoment}
            aria-label="Adicionar momento"
            title="Adicionar momento"
          >
            <Check size={18} />
          </S.MomentButton>
        </S.MomentForm>
        <S.Section>
          <S.SectionHeaderColumn>
            <S.SectionTitle>Lista de músicas</S.SectionTitle>
            <S.FormInput placeholder="Filtrar por título ou autor" onChange={handleFilter} />
          </S.SectionHeaderColumn>
          <S.SectionContent>
            {songList
              .filter((song) => !selectedSongs.find((a) => a.id == song.id))
              .map((song: Song) => (
                <S.Badge $variant="darkGray" onClick={() => handleClickSong(song)} key={`song-list-${song.id}`}>
                  {/* <S.ASide>
                    <SongList.Thumbnail>
                      <img src="/assets/no-photo.png" alt="" />
                    </SongList.Thumbnail>
                  </S.ASide> */}
                  <S.ASide>
                    <S.BadgeTitle>{song.name}</S.BadgeTitle>
                    <S.BadgeSubTitle>{song.author}</S.BadgeSubTitle>
                  </S.ASide>
                </S.Badge>
              ))}
          </S.SectionContent>
        </S.Section>

        <S.Section>
          <S.SectionContent>
            {selectedSongs.length === 0 && (
              <div style={{ width: '100%' }}>
                <S.SectionTitle>Nenhuma música adicionada</S.SectionTitle>
              </div>
            )}
            {selectedSongs.map((song: Song, index) => (
              <S.Badge
                $variant="darkGray"
                $selected={!!selectedSongs.find((a) => a.id === song.id)}
                key={`selected-song-${song.id}`}
                draggable
                onDragStart={() => handleDragStart(selectedSongs.findIndex((a) => a.id === song.id))}
                onDragOver={(e) =>
                  handleDragOver(
                    selectedSongs.findIndex((a) => a.id === song.id),
                    e,
                  )
                }
                onDragLeave={handleDragLeave}
                onDrop={(e) =>
                  handleDrop(
                    selectedSongs.findIndex((a) => a.id === song.id),
                    e,
                  )
                }
                style={{
                  opacity: draggedIndex === selectedSongs.findIndex((a) => a.id === song.id) ? 0.5 : 1,
                  backgroundColor:
                    dragOverIndex === selectedSongs.findIndex((a) => a.id === song.id) ? '#332b4b' : undefined,
                  cursor: 'grab',
                }}
              >
                {/* <S.ASide>
                  <SongList.Thumbnail>
                    <img src="/assets/no-photo.png" alt="" />
                  </SongList.Thumbnail>
                </S.ASide> */}
                <S.ASideTitle>
                  <S.BadgeTitle>{song.name}</S.BadgeTitle>
                  <S.BadgeSubTitle>{song.author}</S.BadgeSubTitle>
                </S.ASideTitle>
                <S.ASideDetails>
                  {/* <S.BadgeTitle>{song.key}</S.BadgeTitle> */}
                  <S.BadgeTitle>
                    <input value={song.key ?? ''} onChange={(e) => updateKeyOnSelectedSong(e, index)} />
                  </S.BadgeTitle>
                  <S.BadgeSubTitle>{song.rhythm}</S.BadgeSubTitle>
                </S.ASideDetails>
                <S.ASidePosition>
                  <S.PositionText>#{selectedSongs.findIndex((a) => a.id === song.id) + 1}</S.PositionText>
                </S.ASidePosition>
                <S.ASideButtons>
                  <i onClick={() => handleClickSong(song)} style={{ backgroundColor: '#991b1b' }}>
                    <X size={15} />
                  </i>
                  <i style={{ cursor: 'grab' }}>
                    <ArrowDownUp size={15} />
                  </i>
                </S.ASideButtons>
              </S.Badge>
            ))}
          </S.SectionContent>
        </S.Section>
      </S.Content>
      <S.Footer>
        <S.HomeLink to="/">
          <Home size={18} />
          Início
        </S.HomeLink>
        <S.SaveButton type="button" disabled={sendingData} onClick={handleCreateSetlist}>
          <Save size={18} />
          {sendingData ? 'Salvando...' : 'Salvar'}
        </S.SaveButton>
      </S.Footer>
    </S.Container>
  );
};
