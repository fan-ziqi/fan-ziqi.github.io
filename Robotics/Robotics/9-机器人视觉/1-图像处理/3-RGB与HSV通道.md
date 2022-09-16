# RGB与HSV通道

实现彩色图片的读取，进行RGB通道分离，并转化为HSV通道

## 代码

```cpp
#include<opencv2/opencv.hpp>

using namespace cv;

//RGB类
class RGB_Channels
{
private:
	Mat RGB_Color_Channels[3]; //私有成员，禁止外部访问
public:
    //外部修改接口
	Mat* Set_RGB_Color_Channels(void)
	{
		return RGB_Color_Channels;
	}
    //仅读取，禁止外部修改
	Mat Get_R(void) const 
	{
		return RGB_Color_Channels[2];
	}
	Mat Get_G(void) const
	{
		return RGB_Color_Channels[1];
	}
	Mat Get_B(void) const
	{
		return RGB_Color_Channels[0];
	}
};
//HSV类
class HSV_Channels
{
private:
	Mat HSV_Color_Channels[3]; //私有成员，禁止外部访问
public:
    //外部修改接口
	Mat* Set_HSV_Color_Channels(void)
	{
		return HSV_Color_Channels;
	}
    //仅读取，禁止外部修改
	Mat Get_V(void) const
	{
		return HSV_Color_Channels[2];
	}
	Mat Get_S(void) const
	{
		return HSV_Color_Channels[1];
	}
	Mat Get_H(void) const
	{
		return HSV_Color_Channels[0];
	}
};

int main(int argc,char* argv[])
{
	//彩色图片的读取
	Mat image = imread("./test.jpg");
	//RGB三通道分离并显示
	RGB_Channels my_rgb;
	split(image,my_rgb.Set_RGB_Color_Channels());
	imshow("RGB",image);
    imshow("R",my_rgb.Get_R());
    imshow("G",my_rgb.Get_G());
	imshow("B",my_rgb.Get_B());	

	//RGB转HSV
	Mat image_hsv;
	cvtColor(image, image_hsv, COLOR_BGR2HSV_FULL);
	//HSV三通道分离并显示
	HSV_Channels my_hsv;
	split(image_hsv,my_hsv.Set_HSV_Color_Channels());
	imshow("RGB",image);
	imshow("H",my_hsv.Get_H());
	imshow("S",my_hsv.Get_S());
	imshow("V",my_hsv.Get_V());

	waitKey(0);
	return 1;
}
```

## 运行结果

![image-20220302161619338](https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/8f0ffc2404d1a1957390a20f6bb47673.png)