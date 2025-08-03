export declare interface Character {
  name: string;
  avatar: string;
  brief: string;
  category_id: number;
  is_vip: number;
  id: number;
}

export declare interface DialogueInfo {
  character_id: number;
  content: string;
  create_time: string;
  device_id: number;
  id: number;
  speaker: string;
}