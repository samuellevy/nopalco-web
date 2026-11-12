import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Song } from '@/domain/models';
import { SetlistItem } from '@/domain/models/setlist';
import { LoadAllSongsRequest } from '@/domain/usecases';
import { LoadSongRequest } from '@/domain/usecases/songs/load-song-request';
import { LoadSetlistRequest } from '@/domain/usecases/setlists/load-setlist-request';
import { UpdateSongRequest } from '@/domain/usecases/songs/update-song-request';
import { SongComponent } from '@/presentation/components/song-component/song.component';

type Props = {
    loadSongRequest: LoadSongRequest;
    loadAllSongsRequest: LoadAllSongsRequest;
    loadSetlistRequest: LoadSetlistRequest;
    updateSongRequest: UpdateSongRequest;
};

export const SongPage: React.FC<Props> = ({
    loadSongRequest,
    loadAllSongsRequest,
    loadSetlistRequest,
    updateSongRequest,
}) => {
    const navigate = useNavigate();
    const { songId } = useParams<{ songId: string }>();
    const [searchParams] = useSearchParams();
    const setlistId = searchParams.get('setlist');
    const dataKey = searchParams.get('key') || null;
    const [song, setSong] = React.useState<Song | null>(null);
    const [setlistItems, setSetlistItems] = React.useState<SetlistItem[]>([]);
    const [error, setError] = React.useState(false);

    React.useEffect(() => {
        let active = true;
        setSong(null);
        setError(false);

        if (songId) {
            loadSongRequest.execute(songId).then(
                (loadedSong) => {
                    if (active) setSong(loadedSong);
                },
                () => {
                    if (active) setError(true);
                },
            );
        }

        return () => {
            active = false;
        };
    }, [loadSongRequest, songId]);

    React.useEffect(() => {
        let active = true;
        setSetlistItems([]);

        if (setlistId) {
            loadSetlistRequest.execute(setlistId).then(
                (setlist) => {
                    if (active) setSetlistItems(setlist.items);
                },
                (loadError) => console.error('Error loading setlist:', loadError),
            );
        }

        return () => {
            active = false;
        };
    }, [loadSetlistRequest, setlistId]);

    const handleSetlistButton = () => {
        navigate(setlistId ? `/setlists/${setlistId}` : '/');
    };

    const handleAdjacentSong = (offset: number) => {
        const currentIndex = setlistItems.findIndex((item) => item.song?.id === songId);
        const item = currentIndex >= 0 ? setlistItems[currentIndex + offset] : undefined;

        if (item?.song && setlistId) {
            navigate(`/songs/${item.song.id}?setlist=${setlistId}&key=${encodeURIComponent(item.key || '')}`);
        } else {
            handleSetlistButton();
        }
    };

    if (error) return <p role="alert">Erro ao carregar a m&uacute;sica.</p>;
    if (!song || song.id !== songId) return null;

    return (
        <div style={{ width: '100%', overflow: 'auto', paddingBottom: '140px' }}>
            <SongComponent
                key={`${songId}:${dataKey || ''}`}
                data={song}
                dataKey={dataKey}
                loadAllSongsRequest={loadAllSongsRequest}
                loadSetlistRequest={loadSetlistRequest}
                updateSongRequest={updateSongRequest}
                setlistSongList={setlistItems}
                showPageNavigation
                handleSetlistButton={handleSetlistButton}
                handleNextSongButton={() => handleAdjacentSong(1)}
                handlePreviousSongButton={() => handleAdjacentSong(-1)}
            />
        </div>
    );
};