import { SvgXml } from 'react-native-svg';

type SvgAssetProps = {
  xml: string;
  size?: number;
  width?: number;
  height?: number;
  color?: string;
};

export function SvgAsset({ xml, size = 24, width, height, color }: SvgAssetProps) {
  return <SvgXml xml={xml} width={width ?? size} height={height ?? size} color={color} />;
}
