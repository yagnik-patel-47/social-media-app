export interface ProfileData {
  fullName: string,
  email: string,
  userName: string,
  posts: string[],
  followers: string[],
  following: string[],
  savedPosts: string[],
  photo: string,
  likedPosts: string[]
}

const initialData: ProfileData = {
  fullName: "",
  email: "",
  userName: "",
  posts: [],
  followers: [],
  following: [],
  savedPosts: [],
  photo: "",
  likedPosts: [],
};

const profileData = (state=initialData, action) => {
  switch (action.type) {
    case "UPDATE_WHOLE_PROFILE":
      return {
        fullName: action.payload.fullName,
        email: action.payload.email,
        userName: action.payload.userName,
        posts: action.payload.posts,
        followers: action.payload.followers,
        following: action.payload.following,
        savedPosts: action.payload.savedPosts,
        photo: action.payload.photo,
        likedPosts: action.payload.likedPosts,
      };
    default:
      return state;
  }
};

export default profileData;