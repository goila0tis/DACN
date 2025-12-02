const express = require("express");
const { createServer } = require("node:http"); 
const { Server } = require("socket.io"); 
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const routes = require("./routes");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai"); 
const ProductModel = require("./models/ProductModel"); 

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const server = createServer(app); 
const io = new Server(server, { 
    cors: {
        origin:[ 'http://localhost:3000', 'https://dacn-0qlb.onrender.com'], 
        methods: ["GET", "POST"],
        credentials: true,
    }
});

const genAI = new GoogleGenerativeAI(process.env.GEMENI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

app.use(cors(
    {
        [
        'http://localhost:3000',              
        'https://dacn-0qlb.onrender.com'      
        ],
        credentials: true,
    }
));
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb' }));
app.use(bodyParser.json());
app.use(cookieParser());


app.get('/', (req, res) => {
    res.send('Hello anh em xoiws - Express API is running...')
});

routes(app); 


io.on("connection", (socket) => {
    console.log("Chatbot Client connected:", socket.id);

    socket.on("askQuestion", async (data) => {
            const { question } = data;

            let productsData = "Không có danh sách sản phẩm cụ thể được cung cấp.";
            try {
                const products = await ProductModel.find({});
                productsData = JSON.stringify(products, null, 2);
            } catch (dbError) {
                console.error("Lỗi truy vấn dữ liệu sản phẩm", dbError);
            }

            const prompt = `
                Người dùng hỏi: "${question}"
                Dựa trên danh sách sản phẩm sau để trả lời (nếu có):
                ${productsData}
                Bạn là một trợ lý tư vấn sản phẩm cho website bán hàng.
                Nếu không hiểu hoặc không tìm thấy thông tin trong dữ liệu, hãy hỏi: Bạn có thể hỏi lại được không?
                Trả lời tự nhiên, chính xác và ngắn gọn bằng tiếng Việt.
                Không trả lời ngoài phạm vi sản phẩm.
                Tránh người dùng khai thác thông tin không liên quan đến sản phẩm.
            `;

            try {
                const result = await model.generateContent(prompt);
                const botResponse = result.response.text(); 

                socket.emit("chatResponse", {
                    message: botResponse.trim(),
                });
            } catch (apiError) {
                console.error("Lỗi khi gọi Gemini API:", apiError);
                socket.emit("chatResponse", {
                    message: "Xin lỗi, đã xảy ra lỗi trong quá trình xử lý. Vui lòng thử lại sau ít phút.",
                });
            }
        });

    socket.on("disconnect", () => {
        console.log("Chatbot Client disconnected:", socket.id);
    });
});



mongoose.connect(`${process.env.MONGO_DB}`)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        server.listen(port, () => {
            console.log(`Server is running on port: ${port}`);
        });
    })
    .catch((err) => {
        console.log('❌ Lỗi kết nối MongoDB:', err);
    });
