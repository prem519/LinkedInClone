import { getAboutUser, getAllUsers } from '@/config/redux/action/authAction'
import {
  createPost,
  deletePost,
  getAllComments,
  getAllPosts,
  incremenPostLike,
  postComment
} from '@/config/redux/action/postAction'

import DashboardLayout from '@/layout/DashboardLayout'
import UserLayout from '@/layout/UserLayout'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styles from "./index.module.css"
import { BASE_URL } from '@/config'
import { resetPostId } from '@/config/redux/reducer/postReducer'

export default function Dashboard() {

  const dispatch = useDispatch()

  const authState = useSelector((state) => state.auth)
  const postState = useSelector((state) => state.postReducer)

  const [postContent, setPostContent] = useState("")
  const [fileContent, setFileContent] = useState(null)
  const [commentText, setCommentText] = useState("")

  // SAFE FETCH (fixed dependency issue)
  useEffect(() => {
    if (!authState.isTokenThere) return

    dispatch(getAllPosts())
    dispatch(getAboutUser({ token: localStorage.getItem("token") }))

    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers())
    }
  }, [authState.isTokenThere, authState.all_profiles_fetched, dispatch])

  const handleUpload = async () => {
    await dispatch(createPost({ file: fileContent, body: postContent }))
    setPostContent("")
    setFileContent(null)
    dispatch(getAllPosts())
  }

  const user = authState?.user

  if (!user) {
    return (
      <UserLayout>
        <DashboardLayout>
          <h2>Loading...</h2>
        </DashboardLayout>
      </UserLayout>
    )
  }

  return (
    <UserLayout>
      <DashboardLayout>

        <div className={styles.scrollComponent}>

          {/* CREATE POST */}
          <div className={styles.wrapper}>

            <div className={styles.createPostContainer}>

              <img
                className={styles.userProfile}
                src={`${BASE_URL}/${user?.userId?.profilePicture || ""}`}
                alt=""
              />

              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="What's in your mind"
                className={styles.textAreaOfContent}
              />

              <input
                onChange={(e) => setFileContent(e.target.files[0])}
                type="file"
                hidden
                id="fileUpload"
              />

              <label htmlFor="fileUpload">➕</label>

              {postContent.length > 0 && (
                <div onClick={handleUpload} className={styles.uploadButton}>
                  Post
                </div>
              )}

            </div>

            <div className={styles.postContainer}>

              {postState.posts.map((post) => (
                <div key={post._id} className={styles.singleCard}>

                  <div className={styles.singleCard_profileContainer}>

                    <img
                      className={styles.userProfile}
                      src={`${BASE_URL}/${post.userId?.profilePicture || ""}`}
                      alt=""
                    />

                    <div>

                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <p style={{ fontWeight: "bold" }}>
                          {post.userId?.name || "Deleted User"}
                        </p>

                        {post.userId?._id === user?.userId?._id && (
                          <div
                            style={{ cursor: "pointer" }}
                            onClick={async () => {
                              await dispatch(deletePost({ post_Id: post._id }))
                              dispatch(getAllPosts())
                            }}
                          >
                            🗑
                          </div>
                        )}
                      </div>

                      <p style={{ color: "gray" }}>
                        @{post.userId?.username}
                      </p>

                      <p>{post.body}</p>

                      {post.media && (
                        <img
                          src={`${BASE_URL}/${post.media}`}
                          alt=""
                        />
                      )}

                      <div onClick={() => {
                        dispatch(incremenPostLike({ post_Id: post._id }))
                        dispatch(getAllPosts())
                      }}>
                        👍 {post.likes}
                      </div>

                      {/* COMMENTS */}
                      <div onClick={() => {
                        dispatch(getAllComments({ post_Id: post._id }))
                      }}>
                        💬 Comments
                      </div>

                      <div onClick={() => {
                        const text = encodeURIComponent(post.body)
                        const url = encodeURIComponent("premlinkedin.in")
                        window.open(
                          `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
                          "_blank"
                        )
                      }}>
                        🔗 Share
                      </div>

                    </div>

                  </div>

                </div>
              ))}

            </div>

          </div>

        </div>

        
        {postState.postId && (
          <div
            onClick={() => dispatch(resetPostId())}
            className={styles.commentsContainer}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={styles.allCommentsContainer}
            >

              {postState.comments.length === 0 ? (
                <h2>No Comments</h2>
              ) : (
                postState.comments.map((comment) => (
                  <div key={comment._id}>
                    <p>{comment.body}</p>
                  </div>
                ))
              )}

              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Comment"
              />

              <button
                onClick={async () => {
                  await dispatch(postComment({
                    post_Id: postState.postId,
                    commentBody: commentText
                  }))
                  dispatch(getAllComments({ post_Id: postState.postId }))
                  setCommentText("")
                }}
              >
                Comment
              </button>

            </div>
          </div>
        )}

      </DashboardLayout>
    </UserLayout>
  )
}