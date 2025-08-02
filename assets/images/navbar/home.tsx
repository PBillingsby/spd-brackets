import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Pattern, Rect, Image as SvgImage, Use } from 'react-native-svg';

interface HomeIconProps {
  isSelected?: boolean;
}

const HomeIcon: React.FC<HomeIconProps> = ({ isSelected = false }) => {
  const outlineColor = isSelected ? '#CB9A20' : 'black';

  return (
    <View style={styles.iconWrapper}>
      <Svg width="37" height="33" viewBox="0 0 37 33">
        <Rect width="37" height="33" fill="url(#pattern0_4134_5091)" />

        <Rect
          x="0"
          y="0"
          width="37"
          height="33"
          fill="none"
          stroke={outlineColor}
          strokeWidth="2"
          rx="8"
        />

        <Defs>
          <Pattern
            id="pattern0_4134_5091"
            patternContentUnits="objectBoundingBox"
            width="1"
            height="1"
          >
            <Use
              href="#image0_4134_5091"
              transform="matrix(0.00557432 0 0 0.00625 -0.00168919 0)"
            />
          </Pattern>
          <SvgImage
            id="image0_4134_5091"
            width="180"
            height="160"
            preserveAspectRatio="none"
            href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAACgCAYAAAClika/AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDkuMS1jMDAzIDc5Ljk2OTBhODdmYywgMjAyNS8wMy8wNi0yMDo1MDoxNiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpjMWFjNzgwMS1jNWJhLTIzNDItOWY2NC0yYzYzNzZjYmM4MmQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MTAzREVCNTI2Njg0MTFGMDhCM0M5RThGQjVGRjY1Q0EiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MTAzREVCNTE2Njg0MTFGMDhCM0M5RThGQjVGRjY1Q0EiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDI2LjggKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6YzFhYzc4MDEtYzViYS0yMzQyLTlmNjQtMmM2Mzc2Y2JjODJkIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOmMxYWM3ODAxLWM1YmEtMjM0Mi05ZjY0LTJjNjM3NmNiYzgyZCIv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"
          />
        </Defs>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  iconWrapper: {
    padding: 2,
  },
});

export default HomeIcon;
