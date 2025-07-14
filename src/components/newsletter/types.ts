export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'youtube' | 'link';
  url: string;
  title?: string;
  description?: string;
  size?: 'small' | 'medium' | 'large';
  alignment?: 'left' | 'center' | 'right';
  previewUrl?: string;
  textContent?: string;
  textFontSize?: string;
}

export interface ListItem {
  id: string;
  text: string;
  color: string;
}

export interface ListData {
  id: string;
  type: 'bullet' | 'numbered';
  items: ListItem[];
}

export interface Subsection {
  id: string;
  title: string;
  content: string;
  mediaItems?: MediaItem[];
  titleFontSize?: string;
  contentFontSize?: string;
  titleColor?: string;
  lists?: ListData[];
  afterListContent?: string;
  afterListContentFontSize?: string;
}

export interface Section {
  id: string;
  title: string;
  content: string;
  backgroundColor: string;
  sideLineColor: string;
  subsections: Subsection[];
  mediaItems?: MediaItem[];
  lists?: ListData[];
  titleFontSize?: string;
  contentFontSize?: string;
  titleColor?: string;
  contentColor?: string;
  afterListContent?: string;
  afterListContentFontSize?: string;
}
