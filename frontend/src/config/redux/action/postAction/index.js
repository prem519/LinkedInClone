import { clientServer } from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";


export const getAllPosts = createAsyncThunk(
    "post/getAllPosts",
    async(_, thunkAPI)=>{
        try {
           const response = await clientServer.get("/posts") 
           return thunkAPI.fulfillWithValue(response.data)
        } catch (err) {
           return thunkAPI.rejectWithValue(err.response.data); 
        }
    }
)

export const createPost = createAsyncThunk(
    "post/createPost",
    async (userData, thunkAPI)=>{

        const { file , body} = userData;

        try {
        const formData = new FormData();
        formData.append('token' , localStorage.getItem('token'))
        formData.append('body', body);
        formData.append('media', file)
        
        const response = await clientServer.post("/post",formData,{
headers:{
    'Content-Type': 'multipart/form-data'
}
        });

if (response.status===200) {
    return thunkAPI.fulfillWithValue("Post Uploaded")
}else{
    return thunkAPI.rejectWithValue("Post not Uploaded")
}

        } catch (error) {
          return thunkAPI.rejectWithValue(error.response.data);  
        }
    }
)
export const deletePost = createAsyncThunk(
  "post/deletePost",
  async (post, thunkAPI) => {
    try {
      const response = await clientServer.delete("/delete_Post", {
        data: {
          token: localStorage.getItem("token"),
          post_Id: post.post_Id
        }
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const incremenPostLike = createAsyncThunk(
 "post/incremenLike",

async (post, thunkAPI)=>{



try {
  const response = await clientServer.post("/increment_post_like",{
    post_Id:post.post_Id
  })
return thunkAPI.fulfillWithValue(response.data);

} catch (error) {
  return thunkAPI.rejectWithValue(error.response.data)
}
}
)

export const getAllComments = createAsyncThunk(
  "post/gatAllComments",

  async(postData, thunkAPI)=>{
try {
  const response = await clientServer.get("/get_comments",{
params:{
  post_Id:postData.post_Id
}
  });

  return thunkAPI.fulfillWithValue({
    comments:response.data,
    post_Id:postData.post_Id
  });

} catch (error) {
  return thunkAPI.rejectWithValue("Something Went Wrong!");
}
  }
)

export const postComment = createAsyncThunk(
  "post/postComment",
  async (commentData, thunkAPI)=>{
try {
  console.log({
    post_Id:commentData.post_Id,
    body:commentData.body
  })
  const response = await clientServer.post("/comment",{
    token:localStorage.getItem("token"),
    post_Id:commentData.post_Id,
    commentBody:commentData.commentBody
  });
  return thunkAPI.fulfillWithValue(response.data)
} catch (error) {
  return thunkAPI.rejectWithValue("Something went wrong")
}
  }
)