import UserLayout from '@/layout/UserLayout'
import React, { useEffect, useState } from 'react'
import DashboardLayout from '@/layout/DashboardLayout'
import { useDispatch, useSelector } from 'react-redux'
import { getAboutUser } from '@/config/redux/action/authAction'
import styles from "./index.module.css"
import { BASE_URL, clientServer } from '@/config'
import { getAllPosts } from '@/config/redux/action/postAction'

function ProfilePage() {
    const authState = useSelector((state) => state.auth)
    const dispatch = useDispatch()

    const postReducer = useSelector((state) => state.postReducer)

    const [userPosts, setUserPosts] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [inputData, setInputData] = useState({
        company: '',
        position: '',
        years: ''
    })

    const handleWorkInputChange = (e) => {
        const { name, value } = e.target
        setInputData({ ...inputData, [name]: value })
    }

    useEffect(() => {
        dispatch(getAboutUser({ token: localStorage.getItem("token") }))
        dispatch(getAllPosts())
    }, [dispatch])

    useEffect(() => {
        const posts = (postReducer.posts || []).filter(
            (post) =>
                post.userId?.username === authState?.user?.userId?.username
        )

        setUserPosts(posts)
    }, [postReducer.posts, authState?.user?.userId?.username])

    const updateProfilePicture = async (file) => {
        const formData = new FormData()
        formData.append("profile_picture", file)
        formData.append("token", localStorage.getItem("token"))

        await clientServer.post("/update_profile_picture", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })

        dispatch(getAboutUser({ token: localStorage.getItem("token") }))
    }

    const updateProfileData = async () => {
        const user = authState?.user?.userId

        await clientServer.post("/user_update", {
            token: localStorage.getItem("token"),
            name: user?.name
        })

        await clientServer.post("/update_profile_data", {
            token: localStorage.getItem("token"),
            bio: authState?.user?.bio,
            currentPost: authState?.user?.currentPost,
            pastWork: authState?.user?.pastWork,
            education: authState?.user?.education
        })

        dispatch(getAboutUser({ token: localStorage.getItem("token") }))
    }

    const user = authState?.user

    return (
        <UserLayout>
            <DashboardLayout>

                {user?.userId && (
                    <div className={styles.container}>

                        <div className={styles.backDropContainer}>
                            <label
                                htmlFor='profilePictureUpload'
                                className={styles.backDrop_overlay}
                            >
                                <p>Edit</p>
                            </label>

                            <input
                                hidden
                                type="file"
                                id="profilePictureUpload"
                                onChange={(e) =>
                                    updateProfilePicture(e.target.files[0])
                                }
                            />

                            <img
                                src={`${BASE_URL}/${user.userId.profilePicture}`}
                                alt="profile"
                            />
                        </div>

                        <div className={styles.profileContainer_details}>

                            <div style={{ display: "flex", gap: "0.7rem" }}>
                                <div style={{ flex: "0.8" }}>

                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "1.2rem"
                                    }}>
                                        <input
                                            className={styles.nameEdit}
                                            type="text"
                                            value={user.userId.name}
                                            readOnly
                                        />

                                        <p style={{ color: "gray" }}>
                                            @{user.userId.username}
                                        </p>
                                    </div>

                                    <textarea
                                        value={user.bio || ""}
                                        readOnly
                                        rows={4}
                                        style={{ width: "100%" }}
                                    />
                                </div>

                                <div style={{ flex: "0.2" }}>
                                    <h3>Recent Activity</h3>

                                    {userPosts.map((post) => (
                                        <div
                                            key={post._id}
                                            className={styles.postCard}
                                        >
                                            <div className={styles.card}>
                                                <div
                                                    className={
                                                        styles.card_profileContainer
                                                    }
                                                >
                                                    {post.media ? (
                                                        <img
                                                            src={`${BASE_URL}/${post.media}`}
                                                            alt=""
                                                        />
                                                    ) : (
                                                        <div
                                                            style={{
                                                                width: "3.4rem",
                                                                height: "3.4rem"
                                                            }}
                                                        />
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
                                {(user?.pastWork || []).map((work, index) => (
                                    <div
                                        key={index}
                                        className={styles.workHistoryCard}
                                    >
                                        <p style={{ fontWeight: "bold" }}>
                                            {work.company} - {work.position}
                                        </p>
                                        <p>{work.years}</p>
                                    </div>
                                ))}

                                <button
                                    className={styles.addWorkButton}
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    Add Work
                                </button>
                            </div>
                        </div>

                        {user?.userId?.username !== user?.userId?.username && (
                            <div
                                onClick={updateProfileData}
                                className={styles.updateProfileBtn}
                            >
                                Update Profile
                            </div>
                        )}
                    </div>
                )}

                {isModalOpen && (
                    <div
                        onClick={() => setIsModalOpen(false)}
                        className={styles.commentsContainer}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className={styles.allCommentsContainer}
                        >
                            <input
                                onChange={handleWorkInputChange}
                                name="company"
                                placeholder="Enter Company"
                            />
                            <input
                                onChange={handleWorkInputChange}
                                name="position"
                                placeholder="Enter Position"
                            />
                            <input
                                onChange={handleWorkInputChange}
                                name="years"
                                type="number"
                                placeholder="Years"
                            />

                            <div
                                onClick={() => {
                                    setIsModalOpen(false)
                                }}
                                className={styles.updateProfileBtn}
                            >
                                Add Work
                            </div>
                        </div>
                    </div>
                )}

            </DashboardLayout>
        </UserLayout>
    )
}

export default ProfilePage