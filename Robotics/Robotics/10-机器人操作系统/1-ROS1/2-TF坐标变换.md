# TF坐标变换

## 什么是TF

[tf-wiki](http://wiki.ros.org/tf)

> tf is a package that lets the user keep track of multiple coordinate frames over time. tf maintains the relationship between coordinate frames in a tree structure buffered in time, and lets the user transform points, vectors, etc between any two coordinate frames at any desired point in time.

将多个坐标系联系起来,使用tf树定义不同坐标系之间的平移与旋转变换关系，并且持续追踪多个坐标系内的变化情况。

## 为什么需要坐标变换?

在ROS中定义了许多坐标系，有机器人坐标系(base_link)，有雷达坐标系(base_laser)，地图坐标系(map)，里程计坐标系(odom)等。以机器人中心为原点的坐标系，称为base_link坐标系，以激光雷达中心为原点的坐标系，称为base_laser坐标系。以下图机器人与激光雷达为例

![ros-tf-1](https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/ros-tf-1.png)

机器人在运行过程中，激光雷达可以采集到周围障碍物的数据，这些数据是以激光雷达为原点(base_laser参考系)下的测量值。如果我们想使用这些数据帮助机器人完成避障功能，由于激光雷达并不在机器人的中心(base_link)之上，会始终存在一个雷达与机器人中心的偏差值。这个时候，如果我们采用一种坐标变换，将激光数据从base_laser参考系变换到base_link参考下，问题就解决了。所以我们需要定义这两个坐标系之间的变换关系,也就是**TF坐标变换**

## TF变换实例

在 [麦克纳姆轮运动学解算](https://www.fanziqi.site/posts/b6e9d4e.html) 一文中,我提到了ROS的坐标系统与单位制,这里不再累述,请读者自行阅读

以机器人四轮与地面的接触面为X-Y平面，四轮轴心连线的点做垂线，与x-y平面的交点为base_link坐标系原点，车头朝向方向为X轴，正左方向为Y轴，向上为Z轴。如图所示:

**TODO:添加图片**

以思岚激光雷达为例，我们一般在安装时都习惯将雷达不带线的一端朝车头方向，雷达USB端的朝车尾方向,如图所示:

**TODO:添加图片**

雷达正中心为坐标原点，USB端的方向为X轴正方向，正左方向为Y轴，向上为Z轴。

测量雷达中心相对机器人坐标原点(0,0,0)的距离，得到雷达在机器人坐标系中(x:0.1,y:0.0,z:0.2)。前面我们提到，思岚雷达的X轴正方向与机器人的X轴正方向为相反方向，雷达坐标系需要绕Z轴顺时针旋转180度才能与机器人base_link坐标系重合 ，旋转(yaw:3.14,roll:0,pitch:0)。

根据这些数据，当我们获取激光数据后，采用(x: 0.1m, y: 0.0m, z: 0.2m, yaw:3.14, roll:0, pitch:0)的坐标变换，就可以将数据从base_laser参考系变换到base_link参考系，这就定义出了两个参考系之间的变换关系。

为了定义和存储base_link和base_laser两个参考系之间的关系，我们需要将他们添加到tf树中。从树的概念上来讲，tf树中的每个节点都对应一个参考系，而节点之间的边对应于参考系之间的变换关系。tf就是使用这样的树结构，保证每两个参考系之间只有一种遍历方式，而且所有变换关系，都是母节点到子节点的变换。

为了定义参考系，我们需要定义两个节点，一个对应于base_link参考系，一个对应于base_laser参考系。为了创建两个节点之间的边，我们首先需要决定哪一个节点作为母节点，哪一个节点作为子节点，这一点在tf树中是非常重要的。这里我们选择base_link作为母节点，这样会方便后边为机器人添加更多的传感器作为子节点.

## 发布TF变换

我们最常使用的是tf包中的static_transform_publisher，它即可在命令行直接运行，也可写在launch文件中配置坐标转换关系。

```cpp
<node pkg="tf" type="static_transform_publisher" name="base_link_to_laser" args="0.065 0.0 0.245 1.57 0.0 0.0 /base_link /lidar 50" />
```

* pkg：包名，tf
* type：类型，static_transform_publisher
* name：名称，自定，便于理解
* arg：tf参数， x y z yaw pitch roll frame_id child_frame_id period_in_ms
  * x y z 分别代表着相应轴的平移，单位是 米。
  * yaw pitch roll 分别代表着绕z y x 三个轴的转动，单位是 弧度。
  * frame_id 为坐标系变换中的父坐标系， child_frame_id为坐标系变换中的子坐标系。(传感器的frame_id的名称根据厂商或有不同，一般在驱动启动launch可查看，思岚激光雷达的frame_id为/lidar)
  * period_in_ms 为发布频率，单位为 毫秒。通常取100。一毫秒为一秒的千分之一，100毫秒即为0.1秒，也就是10Hz。

## TF常用工具

* tf_monitor 打印tf树中所有参考系信息

  ```bash
  tf_monitor <source_frame> <target_frame>
  ```

* tf_echo 查看指定作消息之间的变换关系

  ```bash
  tf_echo <source_frame> <target_frame>
  ```

* static_transform_publisher 发布两个参考系之间的的静态坐标关系

  ```bash
  static_transform_publisher x y z yaw pitch roll frame id child frame id period
  ```

* view_frame 可视化的调试工具,可以生成pdf文件显示tf树信息

  ```bash
  rosrun tf view_frames
  ```

  



## 参考文献

https://blog.csdn.net/autolabor/article/details/86492895