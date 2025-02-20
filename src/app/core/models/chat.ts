import { Message } from './message';

export interface Chat {
  id: number;
  id_user_one: number;
  id_user_two: number;
  username_one: string;
  username_two: string;
  img_one: string;
  img_two: string | null;
  viewed_one: boolean;
  viewed_two: boolean;
  is_deleted_one: boolean;
  is_deleted_two: boolean;
  last_message: Message;
  im_first?: boolean;
  created_at: Date;
  updated_at: Date;
}

// CREATE TABLE Chat (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     id_user_one INT NOT NULL,
//     id_user_two INT NOT NULL,
//     viewed_one BOOLEAN DEFAULT FALSE,
//     viewed_two BOOLEAN DEFAULT FALSE,
//     is_deleted_one BOOLEAN DEFAULT FALSE,
//     is_deleted_two BOOLEAN DEFAULT FALSE,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//     FOREIGN KEY (id_user_one) REFERENCES Users(id) ON DELETE CASCADE,
//     FOREIGN KEY (id_user_two) REFERENCES Users(id) ON DELETE CASCADE
// );

// CREATE TABLE Message (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     id_chat INT NOT NULL,
//     id_sender INT NOT NULL,
//     message TEXT NOT NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (id_chat) REFERENCES Chat(id) ON DELETE CASCADE
//     FOREIGN KEY (id_sender) REFERENCES Users(id) ON DELETE CASCADE
// );
