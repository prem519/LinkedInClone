import { BASE_URL, clientServer } from '@/config';
import DashboardLayout from '@/layout/DashboardLayout';
import UserLayout from '@/layout/UserLayout';
import React, { useEffect, useState } from 'react';
import styles from "./index.module.css";
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { getAllPosts } from '@/config/redux/action/postAction';
import {
  getConnectionRequest,
  getMyConnectionsRequests,
  sendConnectionRequest
} from '@/config/redux/action/authAction';

export default function ViewProfilePage({ userProfile }) {

  const router = useRouter();
  const dispatch = useDispatch();

  const postReducer = useSelector((state) => state.postReducer);
  const authState = useSelector((state) => state.auth);

  const [userPosts, setUserPosts] = useState([]);
  const [isCurrentUserInConnection, setIsCurrentUserInConnection] = useState(false);
  const [isConnectionNull, setIsConnectionNull] = useState(true);

  const getUserPost = async () => {
    await dispatch(getAllPosts());
    await dispatch(getConnectionRequest({ token: localStorage.getItem("token") }));
    await dispatch(getMyConnectionsRequests({ token: localStorage.getItem("token") }));
  };

  // Filter posts
  useEffect(() => {
    const posts = (postReducer.posts || []).filter(
      (post) => post.userId?.username === router.query.username
    );
    setUserPosts(posts);
  }, [postReducer.posts, router.query.username]);

  // Connection logic
  useEffect(() => {
    const userId = userProfile?.userId?._id;
    if (!userId) return;

    const connection = authState.connections?.find(
      (u) => u.connectionId?._id === userId
    );

    const request = authState.connectionRequest?.find(
      (u) => u.userId?._id === userId
    );

    if (connection) {
      setIsCurrentUserInConnection(true);
      setIsConnectionNull(!connection.status_accepted);
    } else if (request) {
      setIsCurrentUserInConnection(true);
      setIsConnectionNull(!request.status_accepted);
    } else {
      setIsCurrentUserInConnection(false);
      setIsConnectionNull(true);
    }
  }, [authState.connections, authState.connectionRequest, userProfile?.userId?._id]);

  useEffect(() => {
    getUserPost();
  }, []);

  return (
    <div>
      <UserLayout>
        <DashboardLayout>

          <div className={styles.container}>

            {/* BACKDROP */}
            <div className={styles.backDropContainer}>
              {userProfile?.userId?.profilePicture && (
                <img
                  className={styles.backDrop}
                  src={`${BASE_URL}/${userProfile.userId.profilePicture}`}
                  alt="profile"
                />
              )}
            </div>

            {/* PROFILE DETAILS */}
            <div className={styles.profileContainer_details}>

              <div className={styles.profileContainer__flex}>

                <div style={{ flex: "0.8" }}>

                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <h2>{userProfile?.userId?.name}</h2>
                    <p style={{ color: "gray" }}>
                      @{userProfile?.userId?.username}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginTop: "10px" }}>

                    {isCurrentUserInConnection ? (
                      <button className={styles.connectedButton}>
                        {isConnectionNull ? "Pending" : "Connected"}
                      </button>
                    ) : (
                      <button
                        className={styles.connectBtn}
                        onClick={() => {
                          dispatch(
                            sendConnectionRequest({
                              token: localStorage.getItem("token"),
                              user_id: userProfile?.userId?._id
                            })
                          );
                        }}
                      >
                        Connect
                      </button>
                    )}

                    <div
                      style={{ cursor: "pointer" }}
                      onClick={async () => {
                        const response = await clientServer.get(
                          `/user/download_resume?id=${userProfile?.userId?._id}`
                        );
                        window.open(`${BASE_URL}/${response.data.message}`, "_blank");
                      }}
                    >
                      ⬇ Resume
                    </div>

                  </div>

                  <p style={{ marginTop: "10px" }}>{userProfile?.bio}</p>

                </div>

                {/* POSTS */}
                <div style={{ flex: "0.2" }}>
                  <h3>Recent Activity</h3>

                  {userPosts.map((post) => (
                    <div key={post._id} className={styles.postCard}>
                      <div className={styles.card}>

                        <div className={styles.card_profileContainer}>
                          {post.media ? (
                            <img src={`${BASE_URL}/${post.media}`} alt="" />
                          ) : (
                            <div style={{ width: "3.4rem", height: "3.4rem" }} />
                          )}
                        </div>

                        <p>{post.body}</p>

                      </div>
                    </div>
                  ))}

                </div>

              </div>
            </div>

            {/* WORK HISTORY */}
            <div className={styles.workHistory}>
              <h4>Work History</h4>

              <div className={styles.workHistoryContainer}>
                {(userProfile?.pastWork || []).map((work, index) => (
                  <div key={index} className={styles.workHistoryCard}>
                    <p style={{ fontWeight: "bold" }}>
                      {work.company} - {work.position}
                    </p>
                    <p>{work.years}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </DashboardLayout>
      </UserLayout>
    </div>
  );
}

export async function getServerSideProps(context) {
  try {
    const request = await clientServer.get(
      "/user/get_profile_based_on_username",
      {
        params: {
          username: context.query.username,
        },
      }
    );

    return {
      props: {
        userProfile: request.data.profile,
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
}