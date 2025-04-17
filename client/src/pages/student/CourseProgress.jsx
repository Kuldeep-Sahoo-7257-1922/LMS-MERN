import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useLoadUserQuery } from "@/features/api/authApi";
import { useCompleteCourseMutation, useGetCourseProgressQuery, useIncompleteCourseMutation, useUpdateLectureProgressMutation } from "@/features/api/courseProgressApi";
import { CheckCircle, CheckCircle2, CirclePlay } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const CourseProgress = () => {
    const params = useParams()
    const { courseId } = params
    const navigate=useNavigate()

    const { data, isLoading, isError, refetch } = useGetCourseProgressQuery(courseId)
    const [updateLectureProgress] = useUpdateLectureProgressMutation()
    const [completeCourse, { data: markCompleteData, isSuccess: completedSuccess }] = useCompleteCourseMutation()
    const [incompleteCourse, { data: markInCompleteData, isSuccess: incompletedSuccess }] = useIncompleteCourseMutation()

    // console.log(data);

    const courseDetails = data?.data.courseDetails
    const progress = data?.data.progress

    const courseTitle = courseDetails?.courseTitle
    const completed = data?.data.completed


    const [currentLecture, setCurrentLecture] = useState(null)
    const initialLecture = currentLecture || courseDetails?.lectures && courseDetails.lectures[0]

    const isLectureCompleted = (lectureId) => {
        return progress?.some((prog) => prog.lectureId === lectureId && prog.viewed)
    }
    const handleLectureProgress = async (lectureId) => {
        await updateLectureProgress({ courseId, lectureId })
        refetch()
    }

    const handleCompleteCourse = async () => {
        await completeCourse(courseId)
        refetch()
    }

    const handleIncompleteCourse = async () => {
        await incompleteCourse(courseId)
        refetch()
    }

    useEffect(() => {
        if (completedSuccess) {
            toast.success(markCompleteData.message)
        }
        if (incompletedSuccess) {
            toast.success(markInCompleteData.message)
        }
    }, [completedSuccess, incompletedSuccess])

    const handleSelectLecture = (lecture) => {
        setCurrentLecture(lecture)
        handleLectureProgress(lecture._id)
    }
    const { data: userData } = useLoadUserQuery()
    console.log(userData);
    if (isError) return <h1>Failed to load course details</h1>
    if (isLoading) return <h1>Loading...</h1>
    return (
        <div className="mt-16 max-w-7xl mx-auto p-4">
            <div className="flex justify-between mb-4">
                <h1 className="text-3xl font-bold">{courseTitle}</h1>

                <Button
                    onClick={completed ? handleIncompleteCourse : handleCompleteCourse}
                    variant={completed ? "outline" : "default"}
                >
                    {
                        completed ? (
                            <div className="flex items-center">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                <span>Mark as Incompleted all</span>
                            </div>
                        ) :
                            (
                                <>
                                    {/* <CheckCircle /> */}
                                    <span>Mark as Completed all</span>
                                </>
                            )
                    }
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* video section */}
                <div className="flex-1 md:w-3/5 h-fit rounded-lg shadow-lg p-4">
                    <div>
                        {/* video ayega */}
                        <video
                            src={currentLecture?.videoUrl || initialLecture.videoUrl}
                            controls
                            className="w-full h-auto rounded-xl"
                            onPlay={() => handleLectureProgress(currentLecture?._id || initialLecture?._id)}
                        />
                    </div>
                    {/* Display Current watching lecture title */}
                    <div className="mt-2">
                        <h3 className="font-medium text-lg">{
                            `Lecture - ${courseDetails.lectures.findIndex((lecture) => lecture._id === (currentLecture?._id || initialLecture._id)) + 1} : ${currentLecture?.lectureTitle || initialLecture.lectureTitle}`
                        }</h3>
                    </div>
                </div>
                <div className="flex flex-col w-full md:w-2/5 border-t md:border-t-0 md:border-l border-gray-200 md:pl-4 pt-4 md:pt-0">
                    <h2 className="font-semibold text-xl mb-4">Course Lecture</h2>
                    {

                        userData.user.role==="instructor" &&
                        <Button onClick={() => navigate(`/admin/course/${courseId}/lecture`)} className=" my-2 dark:bg-green-700 dark:text-white">Add New Lecture</Button>

                    }
                    <div className="flex-1 overflow-y-auto">
                        {courseDetails?.lectures.map((lecture) => (
                            <Card
                                key={lecture._id}
                                className={`mb-3 hover:cursor-pointer transition transform ${lecture._id === currentLecture?._id ? "bg-gray-200 dark:bg-gray-600" : "dark:bg-gray-800"}`}
                                onClick={() => handleSelectLecture(lecture)}

                            >
                                <CardContent className="flex items-center justify-between p-4">
                                    <div className="flex items-center" >
                                        {isLectureCompleted(lecture._id) ? (
                                            <CheckCircle2 size={24} className="text-green-500 mr-2" />
                                        ) : (
                                            <CirclePlay size={24} className="text-gray-500 mr-2" />
                                        )}
                                        <div>
                                            <CardTitle className="text-lg font-medium">
                                                {lecture.lectureTitle}
                                            </CardTitle>
                                        </div>
                                    </div>
                                    {
                                        isLectureCompleted(lecture._id) && (
                                            <Badge
                                                variant="outine"
                                                className={"bg-green-200 text-green-600"}
                                            >
                                                Completed
                                            </Badge>
                                        )
                                    }

                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseProgress;
