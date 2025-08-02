import { useVideoPlayer, VideoView } from 'expo-video';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

type VideoProps = {
  link: string;
};

export default function ClipSection({ link }: VideoProps) {
  const isYouTube = link.includes('youtube.com') || link.includes('youtu.be');

  if (isYouTube) {
    const videoIdMatch = link.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    const videoId = videoIdMatch?.[1];

    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`;

    return (
      <View style={styles.container}>
        <WebView
          originWhitelist={['*']}
          javaScriptEnabled
          allowsFullscreenVideo
          source={{ uri: embedUrl }}
          style={styles.webview}
        />
      </View>
    );
  }

  const player = useVideoPlayer(link, (player) => {
    player.loop = true;
    player.play();
  });

  return (
    <View style={styles.container}>
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  webview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    backgroundColor: '#000',
  },
});
