import { useEffect, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { currentTrackState } from '../atoms/songAtom'
import useSpotify from './useSpotify'

function useSongInfo() {
  const spotifyApi = useSpotify()
  const currentTrackId = useRecoilValue(currentTrackState)
  const [songInfo, setSongInfo] = useState(null)

  useEffect(() => {
    const fetchSongInfo = async () => {
      if (currentTrackId) {
        const trackinfo = await fetch(
          `https://api.spotify.com/v1/tracks/${currentTrackId}`,
          {
            headers: {
              Authorization: `Bearer ${spotifyApi.getAccessToken()}`,
            },
          }
        ).then((res) => res.json())

        setSongInfo(trackinfo)
      }
    }

    fetchSongInfo()
  }, [currentTrackId, spotifyApi])

  return songInfo
}

export default useSongInfo
