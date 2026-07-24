export type BlockType =
  | 'profile_header'
  | 'title_text'
  | 'body_text'
  | 'quote_text'
  | 'signature_text'
  | 'single_image'
  | 'dual_image'
  | 'badge_icon'
  | 'watermark';

export interface BlockConfig {
  type: BlockType;
  align?: 'left' | 'center' | 'right';
  styleProps?: {
    fontSize?: string;
    fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
    margin?: string;
    padding?: string;
    customCssClass?: string;
  };
  imageCaptions?: [string, string];
}

export interface SlideTemplateSchema {
  id: string;
  styleGroup: string;
  contentType: 'text_only' | 'text_1_image' | 'text_2_images';
  name: string;
  container: {
    layout: 'flex_col' | 'centered_card' | 'split_top_bottom';
    padding?: string;
    justifyContent?: 'start' | 'center' | 'between' | 'end';
    alignItems?: 'start' | 'center' | 'end';
    gap?: string;
  };
  blocks: BlockConfig[];
}
