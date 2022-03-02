import {
  HeartIcon,
  VolumeUpIcon as VolumeDownIcon,
} from '@heroicons/react/outline'
import {
  RewindIcon,
  SwitchHorizontalIcon,
  FastForwardIcon,
  PauseIcon,
  ReplyIcon,
  VolumeUpIcon,
  PlayIcon,
} from '@heroicons/react/solid'
import { debounce } from 'lodash'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { playlistState } from '../atoms/playlistAtom'
import { currentTrackState, isPlayingState } from '../atoms/songAtom'
import useSongInfo from '../hooks/useSongInfo'
import useSpotify from '../hooks/useSpotify'

function Player() {
  const spotifyApi = useSpotify()
  const { data: session, status } = useSession()
  const [currentTrackId, setCurrentTrackId] = useRecoilState(currentTrackState)
  const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState)
  const [volume, setVolume] = useState(50)

  // Hack to make next and previous songs
  // Spotify API is broken on these native controls
  const playlist = useRecoilValue<any>(playlistState)

  const nextSong = () => {
    const nextSongIndex = playlist.tracks?.items.findIndex(
      (track: any) => track.track.id === currentTrackId
    )
    if (nextSongIndex < playlist.tracks.items.length) {
      const nextSongId = playlist.tracks.items[nextSongIndex + 1]?.track.id
      const nextSongUri = playlist.tracks.items[nextSongIndex + 1]?.track.uri
      if (nextSongId) {
        setCurrentTrackId(nextSongId)
        setIsPlaying(true)
        spotifyApi.play({
          uris: [nextSongUri],
        })
      }
    }
  }

  const previousSong = () => {
    const previousSongIndex = playlist.tracks?.items?.findIndex(
      (track: any) => track?.track?.id === currentTrackId
    )
    if (previousSongIndex > 0) {
      const previousSongId =
        playlist.tracks?.items[previousSongIndex - 1]?.track.id
      const previousSongUri =
        playlist.tracks?.items[previousSongIndex - 1]?.track.uri
      if (previousSongId) {
        setCurrentTrackId(previousSongId)
        setIsPlaying(true)
        spotifyApi.play({
          uris: [previousSongUri],
        })
      }
    }
  }

  //********************************************************* */

  const songInfo: any = useSongInfo()
  const fetchCurrentSong = () => {
    if (!songInfo) {
      spotifyApi.getMyCurrentPlayingTrack().then((data) => {
        console.log('Now playing: ', data.body?.item)

        setCurrentTrackId(data.body?.item?.id)

        spotifyApi.getMyCurrentPlaybackState().then((data) => {
          console.log('Now playing: ', data.body)
          setIsPlaying(data.body?.is_playing)
        })
      })
    }
  }

  const handlePlayPause = () => {
    spotifyApi.getMyCurrentPlaybackState().then((data) => {
      if (data.body?.is_playing) {
        spotifyApi.pause()
        setIsPlaying(false)
      } else {
        spotifyApi.play()
        setIsPlaying(true)
      }
    })
  }

  useEffect(() => {
    if (spotifyApi.getAccessToken() && !currentTrackId) {
      //  Fetch song info
      fetchCurrentSong()
      setVolume(50)
    }
  }, [currentTrackId, spotifyApi, session])

  useEffect(() => {
    if (volume > 0 && volume < 100) {
      debouncedAjustVolume(volume)
    }
  }, [volume])

  const debouncedAjustVolume = useCallback(
    debounce((volume) => {
      spotifyApi.setVolume(volume).catch((err) => {})
    }, 500),
    []
  )

  return (
    <div
      className="grid h-24 grid-cols-3 bg-gradient-to-b from-black
     to-gray-900 px-2 text-xs text-white md:px-8 md:text-base"
    >
      {/* Left */}
      <div className="flex items-center space-x-4">
        <img
          className="hidden h-10 w-10 md:inline"
          src={songInfo?.album?.images[0]?.url}
          alt=""
        />
        <div>
          <h3>{songInfo?.name}</h3>
          <p>{songInfo?.artists[0]?.name}</p>
        </div>
      </div>

      {/* Center */}
      <div className="flex items-center justify-evenly">
        <SwitchHorizontalIcon className="button" />
        <RewindIcon onClick={previousSong} className="button" />
        {isPlaying ? (
          <PauseIcon onClick={handlePlayPause} className="button h-10 w-10" />
        ) : (
          <PlayIcon onClick={handlePlayPause} className="button h-10 w-10" />
        )}
        <FastForwardIcon onClick={nextSong} className="button" />
        <ReplyIcon className="button" />
      </div>

      {/* Right */}
      <div className="flex items-center justify-end space-x-3 md:space-x-4">
        <VolumeDownIcon
          onClick={() => volume > 0 && setVolume(volume - 10)}
          className="button"
        />
        <input
          className="md:-w-28 w-14"
          onChange={(e) => setVolume(Number(e.target.value))}
          type="range"
          value={volume}
          min={0}
          max={100}
        />
        <VolumeUpIcon
          onClick={() => volume < 100 && setVolume(volume + 10)}
          className="button"
        />
      </div>
    </div>
  )
}

export default Player
