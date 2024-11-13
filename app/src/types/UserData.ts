interface RoleData {
    name: string;
    description: string;
  }
  
  export interface UserData {
    id: string;
    username: string;
    display_name: string;
    is_active: boolean;
    roles: RoleData[];
  }