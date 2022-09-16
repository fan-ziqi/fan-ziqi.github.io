# OpenCV基础

## 导入图像视频和网络摄像头

首先包含三个常用的头文件和IO库

```cpp
#include <opencv2/imgcodecs.hpp>
#include <opencv2/highgui.hpp>
#include <opencv2/imgproc.hpp>
#include <iostream>
```

然后需要使用命名空间

```cpp
using namespace cv;
using namespace std;
```

### 图像

```cpp
int main()
{
	// 首先需要定义图像文件路径，使用string类型来存储
	string path = "res/test_image.jpg";
    // 用Mat类型读取图像
	Mat img = imread(path);
    // 显示图像
	imshow("图像", img);
    // 使用waitKey进行一个延时，否则图像会立即关闭。0为无穷大，即不会关闭。
	waitKey(0);
	return 0;
}
```

### 视频

```cpp
int main()
{
	// 首先需要定义视频文件路径，使用string类型来存储
	string path = "res/test_video.mp4";
	// 构造VideoCapture类型对象
	VideoCapture cap(path);
	// 单帧图像
	Mat img;
	// 对于视频来说需要捕获所有帧并显示，所以需要while循环。
	while(1)
	{
		// 读取一帧图像
		cap.read(img);
		// 显示图像
		imshow("视频", img);
		// 这时需要延时，否则视频非常快
		waitKey(20);
	}
	return 0;
}
```

视频结束后会抛出错误（无法读取文件），原因为视频结束后没有图像送入img所以报错。

### 摄像头

```cpp
int main()
{
	// 摄像头不需要路径，需要输入相机的ID号，剩下的和读取视频一样
	VideoCapture cap(0);
	cap.set(CAP_PROP_FRAME_WIDTH, 640);
	cap.set(CAP_PROP_FRAME_HEIGHT, 480);
	Mat img;
	while (true)
	{
		cap.read(img);
		imshow("摄像头", img);
		waitKey(1);
	}
	return 0;
}
```

## 基本函数

前文包含的头文件`#include <opencv2/imgproc.hpp>`就是图像处理的头文件

```cpp
int main()
{
	// 原始图像
	string path = "res/test_image.jpg";
	Mat img = imread(path);
	imshow("Image", img);

	Mat imgGray;
	// “convert”，即为转换图像的颜色空间，这里将彩色图想转换为灰度图像
	cvtColor(img, imgGray, COLOR_BGR2GRAY);
	imshow("Image Gray", imgGray);

	Mat imgBlur;
	// 添加高斯模糊(7*7)
	GaussianBlur(imgGray, imgBlur, Size(7, 7), 5, 0);
	imshow("Image Blur", imgBlur);

	Mat imgCanny;
	// 边缘检测，通常在边缘检测前对图像进行一次高斯模糊(可以自行对比有什么区别)
	Canny(imgBlur, imgCanny, 25,75);
	imshow("Image Canny", imgCanny);

	// 有时进行边缘检测的时候，没有被完全填充，或者无法正确检测，可以用膨胀和腐蚀
	Mat imgDil, imgErode;
	// 创建一个用于膨胀和腐蚀的内核，后面的数字越大膨胀的越多(数字要用奇数)
	Mat kernel = getStructuringElement(MORPH_RECT, Size(3, 3));
	// 膨胀
	dilate(imgCanny, imgDil, kernel);
	imshow("Image Dilation", imgDil);
	// 腐蚀
	erode(imgDil, imgErode, kernel);
	imshow("Image Erode", imgErode);

	waitKey(0);
}
```

运行结果：

![image-20220309122257889](https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220309122257889.png)

## 对图像进行伸缩和剪裁

```cpp
int main()
{
	// 原始图像
	string path = "res/test_image.jpg";
	Mat img = imread(path);
	imshow("Image", img);

	// 伸缩
	Mat imgResize;
	// 使用size方法查看图像尺寸
	cout << img.size() << endl;
	// 可以调整成具体的大小
	resize(img, imgResize, Size(400,600));
	imshow("Image Resize Size()", imgResize);
	// 也可以调整缩放比例fxfy
	resize(img, imgResize, Size(),0.5,0.5);
	imshow("Image Resize ", imgResize);

	// 裁剪
	Mat imgCrop;
	// 矩形数据类型，前两个参数为剪裁起点（左上角 x = 0, y = 0），后两个参数为宽和高
	Rect roi(200, 100, 200, 200);
	// 使用刚刚定义的矩形对图像进行裁剪
	imgCrop = img(roi);
	imshow("Image Crop", imgCrop);

	waitKey(0);
}
```

运行结果：

![image-20220309122213509](https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220309122213509.png)

## 绘制形状和文字

下文中，使用Point()定义一个点，使用Scalar()定义一个标量（颜色）

绘制形状和文字所用函数中最后两个参数均为颜色和厚度(FILLED为填充)，不再重复说明

```cpp
int main()
{
	// 创建一个空白图像，512*512大小，8位3通道(CV_8UC3)，白色(255,255,255)
	Mat img(512, 512, CV_8UC3, Scalar(255, 255, 255));

	// 画圆 传入圆心，半径
	circle(img, Point(256, 256), 155, Scalar(0, 69, 255),FILLED);

	// 画矩形 传入左上角与右下角点的坐标
	rectangle(img, Point(130, 226), Point(382, 286), Scalar(255, 255, 255), FILLED);

	// 画线 传入起点和终点的坐标
	line(img, Point(130, 296), Point(382, 296), Scalar(255, 255, 255), 2);

	// 绘制文字 传入文字，左上角坐标，字体，比例
	putText(img, "OpenCV Learning", Point(150, 262), FONT_HERSHEY_COMPLEX, 0.75, Scalar(0, 69, 255),2);

	imshow("Image", img);
	waitKey(0);
}
```
运行结果：

![image-20220309122144678](https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220309122144678.png)

## 透视变换

```cpp
int main()
{
	string path = "res/cards.jpg";
	Mat img = imread(path);

	// 可以使用画图工具获取到点坐标，使用Point2f创建浮点数
	Point2f src[4] = { {529,142},{771,190},{405,395},{674,457} };

	// 变换后的大小
	float w = 250, h = 350;
	Point2f dst[4] = { {0.0f,0.0f},{w,0.0f},{0.0f,h},{w,h} };

	//创建变换矩阵
	Mat matrix = getPerspectiveTransform(src, dst);

	// 透视变换
	Mat imgWarp;
	warpPerspective(img, imgWarp, matrix, Size(w, h));
	imshow("Image Warp", imgWarp);

	// 显示四个顶点
	for (int i = 0; i < 4; i++)
	{
		circle(img, src[i], 10, Scalar(0, 0, 255), FILLED);
	}
	imshow("Image", img);

	waitKey(0);
}
```

可以看到，成功将图形矫正

![image-20220309122100872](https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220309122100872.png)

## 颜色识别

颜色识别需要设定选取好的hsv三个通道的最大值和最小值

```cpp
int main()
{
	string path = "res/lambo.jpg";
	Mat img = imread(path);
	imshow("Image", img);

	// 在HSV空间中查找颜色更加容易，所以先转化为HSV颜色空间
	Mat imgHSV;
	cvtColor(img, imgHSV, COLOR_BGR2HSV);
	imshow("Image HSV", imgHSV);

	// 定义选取好的六个值
	int hmin = 0, smin = 110, vmin = 153;
	int hmax = 19, smax = 240, vmax = 255;
	// 定义下限和上限
	Scalar lower(hmin, smin, vmin);
	Scalar upper(hmax, smax, vmax);
	
	//创建遮罩
	Mat mask;
	inRange(imgHSV, lower, upper, mask);
	imshow("Image Mask", mask);
	
	waitKey(0);
}
```

运行查看效果

![image-20220309121922828](https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220309121922828.png)

上面的值可以使用Trackbar试出来，替换一张图片再次尝试

```cpp
int main()
{
	string path = "res/shapes.jpg";
	Mat img = imread(path);
	imshow("Image", img);

	// 在HSV空间中查找颜色更加容易，所以先转化为HSV颜色空间
	Mat imgHSV;
	cvtColor(img, imgHSV, COLOR_BGR2HSV);
	imshow("Image HSV", imgHSV);

	// 设定初始值
	int hmin = 0, smin = 0, vmin = 0;
	int hmax = 179, smax = 255, vmax = 255;

	// 创建遮罩
	Mat mask;

	// 定义窗口名
	namedWindow("Trackbars", (640, 200));
	// 创建Trackbar
	createTrackbar("Hue Min", "Trackbars", &hmin, 179);
	createTrackbar("Hue Max", "Trackbars", &hmax, 179);
	createTrackbar("Sat Min", "Trackbars", &smin, 255);
	createTrackbar("Sat Max", "Trackbars", &smax, 255);
	createTrackbar("Val Min", "Trackbars", &vmin, 255);
	createTrackbar("Val Max", "Trackbars", &vmax, 255);

	while(1)
	{
		Scalar lower(hmin, smin, vmin);
		Scalar upper(hmax, smax, vmax);
		inRange(imgHSV, lower, upper, mask);

		imshow("Image Mask", mask);
		waitKey(1);
	}
}
```

初始值是这样的

![image-20220309121750288](https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220309121750288.png)

因为这张图里都是确定的颜色，所以只需要拖动前两行即可筛选出想要的颜色

![image-20220309121842503](https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220309121842503.png)

## 形状识别

本节将学习如何检测圆形、正方形、矩形、三角形这些形状，和识别出图像中的轮廓

### 预处理

首先对图像进行预处理得到边缘，依次进行灰度处理、高斯模糊、边缘检测、膨胀、腐蚀。详见

```cpp
int main()
{
	// 原始图像
	string path = "res/shapes.jpg";
	Mat img = imread(path);
	imshow("Image", img);

	// 在识别形状之前需要对图片进行一系列的预处理

	// 灰度处理
	Mat imgGray;
	cvtColor(img, imgGray, COLOR_BGR2GRAY);

	// 高斯模糊
	Mat imgBlur;
	GaussianBlur(imgGray, imgBlur, Size(3, 3), 3, 0);

	// 边缘检测
	Mat imgCanny;
	Canny(imgBlur, imgCanny, 25,75);

	// 膨胀和腐蚀
	Mat imgDil, imgErode;
	// 创建一个用于膨胀和腐蚀的内核，后面的数字越大膨胀的越多(数字要用奇数)
	Mat kernel = getStructuringElement(MORPH_RECT, Size(3, 3));
	// 膨胀
	dilate(imgCanny, imgDil, kernel);
	// 腐蚀
	erode(imgDil, imgErode, kernel);
    
//	// 在这里进行边缘检测
//	getContours(imgDil,img);

	imshow("Image", img);
	imshow("Image Gray", imgGray);
	imshow("Image Blur", imgBlur);
	imshow("Image Canny", imgCanny);
	imshow("Image Dil", imgDil);

	waitKey(0);
}
```

从处理后的图像可以看到，单单使用边缘检测，三角形的轮廓线断断续续，会对之后的识别造成影响。经过膨胀之后的图像轮廓线是实线，边缘特性更好。

![image-20220309144348598](https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220309144348598.png)

关闭主函数中无用的输出，只留下`imshow("Image", img);`，然后去除`getContours(imgDil,img);`的注释，再进行下一步。

### 找到轮廓

根据边缘找到轮廓

```cpp
void getContours(Mat img_input, Mat img_output)
{
	/*
	 * contours是一个双重向量，向量内每个元素保存了一组由连续的Point点构成的点的集合的向量，每一组Point点集就是一个轮廓。有多少轮廓，向量contours就有多少元素。
	 * 相当于创建了这样一个向量{{Point(),Point()},{},{}}
	 * */
	vector<vector<Point>> contours;
	/*
	 * hierarchy向量内每个元素保存了一个包含4个int整型的数组。向量hiararchy内的元素和轮廓向量contours内的元素是一一对应的，向量的容量相同。
	 * hierarchy向量内每一个元素的4个int型变量——hierarchy[i][0] ~ hierarchy[i][3]，分别表示第i个轮廓的后一个轮廓、前一个轮廓、父轮廓、内嵌轮廓的索引编号。
	 * 如果当前轮廓没有对应的后一个轮廓、前一个轮廓、父轮廓或内嵌轮廓的话，则hierarchy[i][0] ~ hierarchy[i][3]的相应位被设置为默认值-1。
	 * */
	vector<Vec4i> hierarchy;

	/*
	 * 找到轮廓
	 * 第一个参数：单通道图像矩阵，可以是灰度图，但更常用的是二值图像，一般是经过Canny、拉普拉斯等边缘检测算子处理过的二值图像；
	 * 第二个参数：contours （前文介绍过）
	 * 第三个参数：hierarchy（前文介绍过）
	 * 第四个参数：轮廓的检索模式
	 * 		取值一：CV_RETR_EXTERNAL 只检测最外围轮廓，包含在外围轮廓内的内围轮廓被忽略
	 * 		取值二：CV_RETR_LIST     检测所有的轮廓，包括内围、外围轮廓，但是检测到的轮廓不建立等级关系，彼此之间独立，没有等级关系，这就意味着这个检索模式下不存在父轮廓或内嵌轮廓，所以hierarchy向量内所有元素的第3、第4个分量都会被置为-1，具体下文会讲到
	 * 		取值三：CV_RETR_CCOMP    检测所有的轮廓，但所有轮廓只建立两个等级关系，外围为顶层，若外围内的内围轮廓还包含了其他的轮廓信息，则内围内的所有轮廓均归属于顶层
	 * 		取值四：CV_RETR_TREE     检测所有轮廓，所有轮廓建立一个等级树结构。外层轮廓包含内层轮廓，内层轮廓还可以继续包含内嵌轮廓。
	 * 第五个参数：轮廓的近似方法
	 * 		取值一：CV_CHAIN_APPROX_NONE   保存物体边界上所有连续的轮廓点到contours向量内
	 * 		取值二：CV_CHAIN_APPROX_SIMPLE 仅保存轮廓的拐点信息，把所有轮廓拐点处的点保存入contours向量内，拐点与拐点之间直线段上的信息点不予保留
	 * 		取值三和四：CV_CHAIN_APPROX_TC89_L1，CV_CHAIN_APPROX_TC89_KCOS使用teh-Chinl chain 近似算法
	 * 第六个参数：Point偏移量，所有的轮廓信息相对于原始图像对应点的偏移量，相当于在每一个检测出的轮廓点上加上该偏移量，且Point可以是负值。不填为默认不偏移Point()
	 * */
	findContours(img_input, contours, hierarchy, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);

	/*
	 * 第一个参数：指明在哪幅图像上绘制轮廓。image为三通道才能显示轮廓
	 * 第二个参数：contours
	 * 第三个参数：指定绘制哪条轮廓，如果是-1，则绘制其中的所有轮廓
	 * 第四个参数：轮廓线颜色
	 * 第五个参数：轮廓线的宽度，如果是-1（FILLED），则为填充
	 * */
	drawContours(img_output, contours, -1, Scalar(255, 0, 255), 2);
}
```

可以看到，图像轮廓被正确地识别出来了。

![image-20220309134724054](https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220309134724054.png)

### 去除噪声

假设图像中最小的黑色圆圈为噪声，我们要将其滤除，所以需要判断轮廓大小并对其筛选。

```cpp
void getContours(Mat img_input, Mat img_output)
{

	vector<vector<Point>> contours;
	vector<Vec4i> hierarchy;

	findContours(img_input, contours, hierarchy, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);

	// 假设图像中有噪声，需要将其过滤
	for (int i = 0; i < contours.size(); i++)
	{
        //检测轮廓大小
		int area = contourArea(contours[i]);
		cout << area << endl;

		if (area > 1000)
		{
			drawContours(img_output, contours, i, Scalar(255, 0, 255), 2);
		}
	}
}
```

可以看到，黑色噪声成功被滤除

![image-20220309135058081](https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220309135058081.png)

### 识别形状

下一步我们要找到这些轮廓的角点，并对角点的数量进行判断，例如三角形就是3，四边形就是4，圆形可能七八个，并同时绘制出边界框与形状名称。

```cpp
void getContours(Mat img_input, Mat img_output)
{
	vector<vector<Point>> contours;
	vector<Vec4i> hierarchy;

	findContours(img_input, contours, hierarchy, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
	// 不全输出，在下文只输出角点
//	drawContours(img_output, contours, -1, Scalar(255, 0, 255), 2);

	// 定义轮廓，大小与contours相同，但内层向量中只有角点（例如三角形就是3，四边形就是4，圆形可能七八个）
	vector<vector<Point>> contours_corners(contours.size());

	// 定义边界框，大小与contours相同
	vector<Rect> bounding_box(contours.size());

	// 定义图形形状字符串
	string object_type;

	for (int i = 0; i < contours.size(); i++)
	{
		int contour_area = contourArea(contours[i]);
		cout << contour_area << endl;

		if (contour_area > 1000)
		{
			// 计算每个轮廓的周长
			float contour_perimeter = arcLength(contours[i], true);

			// 使用DP算法计算出轮廓点的个数，规则为周长*0.02
			approxPolyDP(contours[i], contours_corners[i], 0.02 * contour_perimeter, true);
			cout << contours_corners[i].size() << endl;

			// 找出边界框
			bounding_box[i] = boundingRect(contours_corners[i]);

			// 通过判断角点的数量来确定是什么形状
			int object_corners = (int)contours_corners[i].size();
			if(object_corners == 3)
			{
				object_type = "Triangle";
			}
			else if(object_corners == 4)
			{
				// 通过计算宽高比来区分正方形和矩形
				float aspect_ratio = (float)bounding_box[i].width / (float)bounding_box[i].height;
				cout << aspect_ratio << endl;
				// 宽高比在0.95~1.05范围内算作正方形
				if (aspect_ratio > 0.95 && aspect_ratio < 1.05)
				{
					object_type = "Square";
				}
				// 其余的算作矩形
				else
				{
					object_type = "Rectangle";
				}
			}
			else if(object_corners > 4)
			{
				object_type = "Circle";
			}

			// 只绘制角点之间的边框线
			drawContours(img_output, contours_corners, i, Scalar(255, 0, 255), 2);
			// 绘制矩形，bounding_box[i].tl()左上角，bounding_box[i].br()右下角
			rectangle(img_output, bounding_box[i].tl(), bounding_box[i].br(), Scalar(0, 255, 0), 5);
			// 绘制文字（什么形状），绘制在边框的左上角再往上5像素
			putText(img_output, object_type, Point(bounding_box[i].x, bounding_box[i].y - 5 ), FONT_HERSHEY_PLAIN, 1.5, Scalar(0, 69, 255), 2);
		}
	}
}
```

可以看到，不同形状的物体被成功识别出。

![image-20220309143927287](https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220309143927287.png)

## 人脸检测

人脸检测需要包含`#include <opencv2/objdetect.hpp>`头文件

使用OpenCV自带的Haar特征分类器进行检测。Haar特征分类器就是一个XML文件，该文件中会描述人体各个部位的Haar特征值。包括人脸、眼睛、嘴唇等等。通常被放置在一个叫haarcascades的目录下（全盘搜索一下就能找到），有以下这些：

![image-20220309152132992](https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220309152132992.png)

根据命名可以知道各个分类器的用途。

```cpp
int main()
{
	string path = "res/face.jpg";
	Mat img = imread(path);

	// 编写级联分类器
	CascadeClassifier faceCascade;
	// 加载训练好的模型（族特征数据库）这里的路径请自行修改
	faceCascade.load("/usr/share/opencv4/haarcascades/haarcascade_frontalface_default.xml");
	if (faceCascade.empty())
	{
		cout << "XML file not loaded" << endl;
	}

	// 创建一个矩形向量
	vector<Rect> faces;
	/*
	 * 族检测算法
	 * 参数1：image--待检测图片，一般为灰度图像加快检测速度；
	 * 参数2：objects--被检测物体的矩形框向量组；
	 * 参数3：scaleFactor--表示在前后两次相继的扫描中，搜索窗口的比例系数。默认为1.1即每次搜索窗口依次扩大10%;
	 * 参数4：minNeighbors--表示构成检测目标的相邻矩形的最小个数(默认为3个)。
	 * 		如果组成检测目标的小矩形的个数和小于 min_neighbors - 1 都会被排除。
	 * 		如果min_neighbors 为 0, 则函数不做任何操作就返回所有的被检候选矩形框，
	 * 		这种设定值一般用在用户自定义对检测结果的组合程序上；
	 * 参数5：flags--要么使用默认值，要么使用CV_HAAR_DO_CANNY_PRUNING
	 * 		如果设置为CV_HAAR_DO_CANNY_PRUNING，那么函数将会使用Canny边缘检测来排除边缘过多或过少的区域，因此这些区域通常不会是人脸所在区域；
	 * 参数6、7：minSize和maxSize用来限制得到的目标区域的范围。
	 * */
	faceCascade.detectMultiScale(img, faces, 1.1, 10);

	// 在脸四周画出矩形
	for (int i = 0; i < faces.size(); i++)
	{
		rectangle(img, faces[i].tl(), faces[i].br(), Scalar(255, 0, 255), 3);
	}

	imshow("Image", img);
	waitKey(0);
}
```

运行可以看到成功检测到人脸

![image-20220309153539038](https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220309153539038.png)

同样地，可以对视频流进行同样的处理

```cpp
int main()
{
	VideoCapture cap(0);
	cap.set(CAP_PROP_FRAME_WIDTH, 640);
	cap.set(CAP_PROP_FRAME_HEIGHT, 480);

	CascadeClassifier faceCascade;
	faceCascade.load("/usr/share/opencv4/haarcascades/haarcascade_frontalface_default.xml");

	Mat img;
	while (true)
	{
		cap.read(img);

		if (faceCascade.empty()) { cout << "XML file not loaded" << endl;}

		vector<Rect> faces;
		faceCascade.detectMultiScale(img, faces, 1.1, 10);

		for (int i = 0; i < faces.size(); i++)
		{
			rectangle(img, faces[i].tl(), faces[i].br(), Scalar(255, 0, 255), 3);
		}

		imshow("Image", img);
		waitKey(1);
	}
}
```

下面演示三个应用

## 应用1 空间绘图

```cpp
#include <opencv2/imgcodecs.hpp>
#include <opencv2/highgui.hpp>
#include <opencv2/imgproc.hpp>
#include <iostream>

using namespace cv;
using namespace std;

/////////////////  Project 1 - 虚拟绘图 //////////////////////

Mat img;
VideoCapture cap(0);
vector<vector<int>> newPoints;  // to store all points

/////////////////////  颜色定义 ////////////////////////////////
// 使用前面讲过的程序提取颜色
// hmin, smin, vmin hmax, smax, vmax
vector<vector<int>> myColors{ {95,22,49,139,138,92}, // Green
							  {144,76,63,179,166,154} };// Red
vector<Scalar> myColorValues{ {0,255,0},		// Green
							  {0,0,255} };// Red
////////////////////////////////////////////////////////////////////

Point getContours(Mat img_input)
{
	vector<vector<Point>> contours;
	vector<Vec4i> hierarchy;

	findContours(img_input, contours, hierarchy, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);

	vector<vector<Point>> contours_corners(contours.size());
	vector<Rect> bounding_box(contours.size());

	// 定义笔头位置
	Point myPoint(0, 0);

	for (int i = 0; i < contours.size(); i++)
	{
		int contour_area = contourArea(contours[i]);
		cout << contour_area << endl;

		if (contour_area > 1000)
		{
			float contour_perimeter = arcLength(contours[i], true);

			approxPolyDP(contours[i], contours_corners[i], 0.02 * contour_perimeter, true);
			cout << contours_corners[i].size() << endl;

			bounding_box[i] = boundingRect(contours_corners[i]);

			// 设定笔头位置为设定点
			myPoint.x = bounding_box[i].x + bounding_box[i].width / 2;
			myPoint.y = bounding_box[i].y;

//			// 显示角和边界框
//			drawContours(img, contours_corners, i, Scalar(255, 0, 255), 2);
//			rectangle(img, bounding_box[i].tl(), bounding_box[i].br(), Scalar(0, 255, 0), 5);
		}
	}
	return myPoint;
}

vector<vector<int>> findColor(Mat img)
{
	Mat imgHSV;
	cvtColor(img, imgHSV, COLOR_BGR2HSV);

	for (int i = 0; i < myColors.size(); i++)
	{
		Scalar lower(myColors[i][0], myColors[i][1], myColors[i][2]);
		Scalar upper(myColors[i][3], myColors[i][4], myColors[i][5]);
		Mat mask;
		inRange(imgHSV, lower, upper, mask);
		imshow(to_string(i), mask);
		Point myPoint = getContours(mask);
		if (myPoint.x != 0 )
		{
			// 每个myPoint都有三个值，xy和颜色序号
			newPoints.push_back({ myPoint.x,myPoint.y,i });
		}
	}
	return newPoints;
}

void drawOnCanvas(vector<vector<int>> newPoints, vector<Scalar> myColorValues)
{

	for (int i = 0; i < newPoints.size(); i++)
	{
		circle(img, Point(newPoints[i][0],newPoints[i][1]), 10, myColorValues[newPoints[i][2]], FILLED);
	}
}


int main()
{
	cap.set(CAP_PROP_FRAME_WIDTH, 640);
	cap.set(CAP_PROP_FRAME_HEIGHT, 480);
	while (true) {

		cap.read(img);
		newPoints = findColor(img);
		drawOnCanvas(newPoints, myColorValues);

		imshow("Image", img);
		waitKey(1);
	}
}
```

## 应用2 文章扫描

```cpp
#include <opencv2/imgcodecs.hpp>
#include <opencv2/highgui.hpp>
#include <opencv2/imgproc.hpp>
#include <iostream>

using namespace cv;
using namespace std;

///////////////  Project 2 - Document Scanner  //////////////////////

Mat imgOriginal, imgGray, imgBlur, imgCanny, imgThre, imgDil, imgErode, imgWarp, imgCrop;
vector<Point> initialPoints,docPoints;
float w = 420, h = 596;

Mat preProcessing(Mat img)
{
	cvtColor(img, imgGray, COLOR_BGR2GRAY);
	GaussianBlur(imgGray, imgBlur, Size(3, 3), 3, 0);
	Canny(imgBlur, imgCanny, 25, 75);
	Mat kernel = getStructuringElement(MORPH_RECT, Size(3, 3));
	dilate(imgCanny, imgDil, kernel);
	//erode(imgDil, imgErode, kernel);
	return imgDil;
}

vector<Point> getContours(Mat image) {

	vector<vector<Point>> contours;
	vector<Vec4i> hierarchy;

	findContours(image, contours, hierarchy, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);
	//drawContours(img, contours, -1, Scalar(255, 0, 255), 2);
	vector<vector<Point>> conPoly(contours.size());
	vector<Rect> boundRect(contours.size());

	vector<Point> biggest;
	int maxArea=0;

	for (int i = 0; i < contours.size(); i++)
	{
		int area = contourArea(contours[i]);
		//cout << area << endl;

		string objectType;

		if (area > 1000)
		{
			float peri = arcLength(contours[i], true);
			approxPolyDP(contours[i], conPoly[i], 0.02 * peri, true);

			if (area > maxArea && conPoly[i].size()==4 ) {

				//drawContours(imgOriginal, conPoly, i, Scalar(255, 0, 255), 5);
				biggest = { conPoly[i][0],conPoly[i][1] ,conPoly[i][2] ,conPoly[i][3] };
				maxArea = area;
			}
			//drawContours(imgOriginal, conPoly, i, Scalar(255, 0, 255), 2);
			//rectangle(imgOriginal, boundRect[i].tl(), boundRect[i].br(), Scalar(0, 255, 0), 5);
		}
	}
	return biggest;
}

void drawPoints(vector<Point> points, Scalar color)
{
	for (int i = 0; i < points.size(); i++)
	{
		circle(imgOriginal, points[i], 10, color, FILLED);
		putText(imgOriginal, to_string(i), points[i], FONT_HERSHEY_PLAIN, 4, color, 4);
	}
}

vector<Point> reorder(vector<Point> points)
{
	vector<Point> newPoints;
	vector<int>  sumPoints, subPoints;

	for (int i = 0; i < 4; i++)
	{
		sumPoints.push_back(points[i].x + points[i].y);
		subPoints.push_back(points[i].x - points[i].y);
	}

	newPoints.push_back(points[min_element(sumPoints.begin(), sumPoints.end()) - sumPoints.begin()]); //0
	newPoints.push_back(points[max_element(subPoints.begin(), subPoints.end()) - subPoints.begin()]); //1
	newPoints.push_back(points[min_element(subPoints.begin(), subPoints.end()) - subPoints.begin()]); //2
	newPoints.push_back(points[max_element(sumPoints.begin(), sumPoints.end()) - sumPoints.begin()]); //3

	return newPoints;
}

Mat getWarp(Mat img, vector<Point> points, float w, float h )
{
	Point2f src[4] = { points[0],points[1],points[2],points[3] };
	Point2f dst[4] = { {0.0f,0.0f},{w,0.0f},{0.0f,h},{w,h} };

	Mat matrix = getPerspectiveTransform(src, dst);
	warpPerspective(img, imgWarp, matrix, Point(w, h));

	return imgWarp;
}

int main() {

	string path = "res/paper.jpg";
	imgOriginal = imread(path);
	resize(imgOriginal, imgOriginal, Size(), 0.5, 0.5);

	// Preprpcessing - Step 1
	imgThre = preProcessing(imgOriginal);

	// Get Contours - Biggest  - Step 2
	initialPoints = getContours(imgThre);
//	drawPoints(initialPoints, Scalar(0, 0, 255));
	docPoints = reorder(initialPoints);
//	drawPoints(docPoints, Scalar(0, 255, 0));

	// Warp - Step 3
	imgWarp = getWarp(imgOriginal, docPoints, w, h);

	//Crop - Step 4
	int cropVal= 5;
	Rect roi(cropVal, cropVal, w - (2 * cropVal), h - (2 * cropVal));
	imgCrop = imgWarp(roi);

	imshow("Image", imgOriginal);
	imshow("Image Dilation", imgThre);
	imshow("Image Warp", imgWarp);
	imshow("Image Crop", imgCrop);
	waitKey(0);
}
```

## 应用3 车牌检测

```cpp
#include <opencv2/imgcodecs.hpp>
#include <opencv2/highgui.hpp>
#include <opencv2/imgproc.hpp>
#include <opencv2/objdetect.hpp>
#include <iostream>

using namespace cv;
using namespace std;

///////////////  Project 3 - 牌照检测 //////////////////////

int main()
{
	Mat img;
	VideoCapture cap(0);

	CascadeClassifier plateCascade;
	plateCascade.load("Resources/haarcascade_russian_plate_number.xml");

	if (plateCascade.empty()) { cout << "XML file not loaded" << endl; }

	vector<Rect> plates;

	while (true) {

		cap.read(img);
		plateCascade.detectMultiScale(img, plates, 1.1, 10);

		for (int i = 0; i < plates.size(); i++)
		{
			Mat imgCrop = img(plates[i]);
			//imshow(to_string(i), imgCrop);
			imwrite("Resources/Plates/" + to_string(i) + ".png", imgCrop);
			rectangle(img, plates[i].tl(), plates[i].br(), Scalar(255, 0, 255), 3);
		}

		imshow("Image", img);
		waitKey(1);
	}
}

```

