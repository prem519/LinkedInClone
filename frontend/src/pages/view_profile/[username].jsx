import { BASE_URL, clientServer } from '@/config';
import DashboardLayout from '@/layout/DashboardLayout';
import UserLayout from '@/layout/UserLayout';
import React, { useEffect, useState } from 'react'
import styles from "./index.module.css"
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { getAllPosts } from '@/config/redux/action/postAction';
import { getConnectionRequest, getMyConnectionsRequests } from '@/config/redux/action/authAction';
import { sendConnectionRequest } from '@/config/redux/action/authAction';

export default function ViewProfilePage({ userProfile }) {

  const router = useRouter();
  const postReducer = useSelector((state) => state.postReducer);
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  const [userPosts, setUserPosts] = useState([]);
  const [isCurrentUserInConnection, setIsCurrentUserInConnection] = useState(false);
  const [isConnectionNull, setIsConnectionNull] = useState(true);

  const getUserPost = async () => {
    await dispatch(getAllPosts());
    await dispatch(getConnectionRequest({ token: localStorage.getItem("token") }));
    await dispatch(getMyConnectionsRequests({ token: localStorage.getItem("token") }));
  }

  useEffect(() => {
    let post = (postReducer.posts || []).filter((post) => {
      return post.userId?.username === router.query.username;
    });
    setUserPosts(post);
  }, [postReducer.posts, router.query.username]);

  useEffect(() => {

    if (!userProfile?.userId?._id) return;

    const connection = authState.connections?.find(
      user => user.connectionId?._id === userProfile.userId._id
    );

    const request = authState.connectionRequest?.find(
      user => user.userId?._id === userProfile.userId._id
    );

    if (connection) {
      setIsCurrentUserInConnection(true);
      setIsConnectionNull(!connection.status_accepted);
    } else if (request) {
      setIsCurrentUserInConnection(true);
      setIsConnectionNull(!(request.status_accepted === true));
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

            <div className={styles.backDropContainer}>
              {userProfile?.userId?.profilePicture && (
                <img
                  className={styles.backDrop}
                  src={`${BASE_URL}/${userProfile.userId.profilePicture}`}
                  alt="profile"
                />
              )}
            </div>

            <div className={styles.profileContainer_details}>

              <div className={styles.profileContainer__flex}>

                <div style={{ flex: "0.8" }}>

                  <div style={{ display: "flex", width: "fit-content", alignItems: "center", gap: "1.2rem" }}>
                    <h2>{userProfile?.userId?.name}</h2>
                    <p style={{ color: "gray" }}>@{userProfile?.userId?.username}</p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>

                    {isCurrentUserInConnection ?
                      <button className={styles.connectedButton}>
                        {isConnectionNull ? "Pending" : "Connected"}
                      </button>
                      :
                      <button onClick={async () => {
                        await dispatch(
                          sendConnectionRequest({
                            token: localStorage.getItem("token"),
                            user_id: userProfile.userId._id
                          })
                        );
                      }} className={styles.connectBtn}>
                        Connect
                      </button>
                    }

                    <div onClick={async () => {
                      const response = await clientServer.get(
                        `/user/download_resume?id=${userProfile.userId._id}`
                      );
                      window.open(`${BASE_URL}/${response.data.message}`, "_blank")
                    }} style={{ cursor: "pointer" }}>
                      <svg style={{ width: "1.2em" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                    </div>

                  </div>

                  <div>
                    <p>{userProfile?.bio}</p>
                  </div>

                </div>

                <div style={{ flex: "0.2" }}>
                  <h3>Recent Activity</h3>

                  {userPosts.map((post) => (
                    <div key={post._id} className={styles.postCard}>
                      <div className={styles.card}>
                        <div className={styles.card_profileContainer}>
                          {post.media !== "" ? (
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

            <div className={styles.workHistory}>
              <h4>Work History</h4>
              <div className={styles.workHistoryContainer}>
                {(userProfile?.pastWork || []).map((work, index) => (
                  <div key={index} className={styles.workHistoryCard}>
                    <p style={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.8rem" }}>
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
  )
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