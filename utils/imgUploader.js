const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3-v3"); // v3 호환 패키지

// AWS S3 클라이언트 초기화
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// 프로필 이미지 업로드 설정
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET,
        acl: "public-read",
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            cb(null, `profile_img/${Date.now()}-${file.originalname}`);
        },
    }),
});

// 게시글 이미지 업로드 설정
const postUpload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET,
        acl: "public-read",
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: (req, file, cb) => {
            //console.log("파일 이미지 업로드 시도");
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            cb(null, `post_img/${Date.now()}-${file.originalname}`);
        },
    }),
});

// 프로필 이미지 삭제 함수 (v3 버전)
async function deleteProfileImg(fileNameToDelete) {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileNameToDelete,
    };

    try {
        await s3.send(new DeleteObjectCommand(params));
        return `Object ${fileNameToDelete} deleted successfully from ${params.Bucket}.`;
    } catch (err) {
        throw new Error(
            `Error deleting object ${fileNameToDelete} from ${params.Bucket}: ${err.message}`
        );
    }
}

module.exports = { upload, deleteProfileImg, postUpload };
