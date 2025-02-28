# 🌜 Image Processing System

This project efficiently processes images from CSV files using asynchronous workers. It uploads images to **Supabase Storage** after compression and allows users to track processing status.

## 🚀 Features
- Uploads a **CSV file** containing product details and image URLs.
- **Asynchronous image processing** (compresses images by 50% quality).
- Stores processed images in **Supabase Storage**.
- Tracks processing status via a **unique request ID**.
- Supports **webhook notifications** after completion.
- Uses **BullMQ and Redis** for background job processing.

---

## 🛠️ Tech Stack
| Component    | Technology |
|-------------|------------|
| **Backend** | Next.js (API Routes) |
| **Database** | Supabase (PostgreSQL) |
| **Queue** | BullMQ (Redis) |
| **Cloud Storage** | Supabase Storage |
| **Image Processing** | Sharp (for compression) |
| **API Testing** | Postman |

---

## 📂 Database Schema

### **🔹 Requests Table**
| Column         | Type        | Description |
|---------------|------------|-------------|
| `id`         | UUID (PK)   | Unique request identifier |
| `status`     | String      | `Pending`, `Completed`, `Failed` |
| `created_at` | Timestamp   | Request submission time |
| `completed_at` | Timestamp | Completion time (if applicable) |

### **🔹 Products Table**
| Column         | Type        | Description |
|---------------|------------|-------------|
| `id`         | Serial (PK) | Unique product identifier |
| `request_id` | UUID (FK)   | Associated request ID |
| `product_name` | String    | Product name from CSV |
| `input_image_urls` | JSONB | Array of input image URLs |
| `output_image_urls` | JSONB | Array of compressed image URLs |
| `status`     | String      | `Pending`, `Completed`, `Failed` |

---

## 📌 API Documentation

### **🔹 Upload CSV**
#### `POST /api/upload`
📌 **Uploads a CSV file and starts processing images.**  
#### **Request (Form-Data)**
| Key  | Type | Description |
|------|------|-------------|
| `file` | File | CSV file with product and image URLs |

#### **Response**
```json
{
  "request_id": "123e4567-e89b-12d3-a456-426614174000",
  "message": "Processing started"
}
```

---

### **🔹 Check Processing Status**
#### `GET /api/status/{request_id}`
📌 **Check the status of a processing request.**  

#### **Response Example (Pending)**
```json
{
  "request_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "Pending",
  "products": [
    {
      "id": 1,
      "product_name": "SKU1",
      "input_image_urls": [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg"
      ],
      "output_image_urls": null,
      "status": "Pending"
    }
  ]
}
```

#### **Response Example (Completed)**
```json
{
  "request_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "Completed",
  "products": [
    {
      "id": 1,
      "product_name": "SKU1",
      "input_image_urls": [
        "https://example.com/image1.jpg"
      ],
      "output_image_urls": [
        "https://supabase.co/storage/public/compressed/1_0.jpg"
      ],
      "status": "Completed"
    }
  ]
}
```

---

### **🔹 Webhook Notification**
📌 **Triggered automatically when all images are processed.**  

#### **Webhook Payload**
```json
{
  "request_id": "123e4567-e89b-12d3-a456-426614174000",
  "message": "Processing complete"
}
```

---

## 🏰️ Low-Level Design (LLD)

### **🔹 System Architecture**
```
User → Next.js API → BullMQ Queue → Worker (Processes Images) → Supabase Storage
```

### **🔹 Component Breakdown**
1. **Next.js API** (Handles CSV uploads, triggers jobs, returns status)
2. **BullMQ Queue** (Stores image processing jobs in Redis)
3. **Worker** (Runs asynchronously, downloads images, compresses, uploads to Supabase)
4. **Supabase Storage** (Stores compressed images)
5. **Webhook Service** (Notifies external services upon completion)

---

## 🛠️ Installation & Setup

### **1️⃣ Clone the Repository**
```bash
git clone https://github.com/myselfshivams/image-processing-system.git
cd image-processing-system
```

### **2️⃣ Install Dependencies**
```bash
npm install
```

### **3️⃣ Set Up Environment Variables (`.env.local`)**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STORAGE_BUCKET=image-uploads
REDIS_URL=redis://your-upstash-redis-url
WEBHOOK_URL=https://your-webhook-endpoint.com
```

### **4️⃣ Run the Project**
```bash
npm run dev
```


---

## 🔥 Postman Collection
- 📌 **[Download Postman Collection](https://github.com/myselfshivams/image-processing-system/blob/main/image-processing-api.postman_collection.json)**

---

