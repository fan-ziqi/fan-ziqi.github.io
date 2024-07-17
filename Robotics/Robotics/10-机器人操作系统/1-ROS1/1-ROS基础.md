# ROS基础

## ROS系统结构

1. 节点(Node) : 软件模块
2. 节点管理器(ROS Master) : 控制中心,提供参数管理
3. 话题(Topic) : 异步通信机制,传输消息Message,可有多个发布者和订阅者
4. 服务(Service) : 同步通信机制,传输请求/应答数据,只允许有一个节点提供指定命名的服务

## ROS工作空间

工作空间(workspace)是存放工程相关文件的文件夹,包括以下四个目录空间

* `src`:代码空间,存放源码
* `build`:编译空间,存储编译的缓存和中间文件
* `devel`:开发空间,存放编译生成的可执行文件
* `install`:安装空间,非必须

### 创建工作空间

(以下使用`WORKSPACE`代表你的工作空间名)

1. 创建工作空间

    ```bash
    mkdir -p ~/WORKSPACE/src
    cd ~/WORKSPACE/src
catkin_init_workspace
    ```

2. 编译工作空间

   ```bash
   cd ~/WORKSPACE/
   catkin_make
   ```
   
3. 设置环境变量

    编译完成后,会自动产生`build`和`devel`,`devel`文件夹中会产生`setup.*sh`样子的环境变量设置脚本,用`source`运行脚本,以生效工作空间中的环境变量.

     ```bash
     source devel/setup.bash
     ```

    但是这么设置环境变量只能在当前终端下生效,如希望在所有终端都生效,则需要在终端的配置文件中添加环境变量的设置:


    ```bash
    echo "source /WORKSPACE/devel/setup.bash">>~/.bashrc
    source ~/.bashrc
    ```

4. 检查环境变量

    ```bash
    echo $ROS_PACKAGE_PATH
    ```

    如果打印的路径中包含当前工作空间的路径,说明环境变量设置成功.

    **TODO:添加成功的截图**

### 创建功能包

(以下使用`PACKAGE`代表创建的功能包)

功能包结构:

PACKAGE/

​		CmakeList.txt	-> 纪录功能报的编译规则

​		package.xml	-> 描述功能包属性的信息

​		......

**功能包不能嵌套,多个功能包需平行放置于代码空间`src`中**

1. 创建功能包

   ```bash
   # catkin_create_pkg命令使用方法:
   # catkin_create_pkg <package_name> [depend1] [depend2] [depend3]
   cd ~/WORKSPACE/src
   catkin_create_pkg learning_communication std_msgs rospy roscpp
   ```

   创建完成后,src下会生成一个`learning_communication`文件夹,已包含`CmakeList.txt`和`package.xml`

2. 编译功能包

   ```bash
   cd ~/WORKSPACE
   catkin_make
   source ~/WORKSPACE/devel/setup.bash
   ```

   **同一工作空间下不能存在同名功能包**

   **不同工作空间下可以存在同名功能包**

所有工作空间的路径会依次顺序记录在ROS_PACKAGE_PATH环境变量中,即新的路径会排在前面.当在不同工作空间下存在同名功能包,ROS会优先查找纪录在最前端的工作空间中有没有需要的功能包,如果不存在则继续向下查找.

可通过以下命令查看所有ROS的环境变量

```bash
env | grep ros
```

查找功能包存放路径

```bah
rospack find PACKAGE
```

**TODO:添加查找功能包的路径图片**

## ROS通信编程

### 话题编程

话题编程流程

1. 创建发布者
2. 创建订阅者
3. 添加编译选项
4. 添加可执行程序

<img src="https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/ros-%E8%AF%9D%E9%A2%98.png" alt="截屏2021-08-25 下午7.46.04" style="zoom: 33%;" />

#### 创建发布者Publisher

```cpp
/**
 * talker.cpp
 * 创建一个Publisher,发布chatter话题,发布字符串"Hello World",类型为string
 */

#include <sstream>
#include "ros/ros.h"
#include "std_msgs/String.h"

int main(int argc, char **argv)
{
  // ROS节点初始化,节点名称为talker
  // 注:节点名称必须唯一 
  ros::init(argc, argv, "talker");
  
  // 创建节点句柄,方便管理节电资源的使用和管理
  ros::NodeHandle n;
  
  // 创建一个Publisher，发布名为chatter的topic，消息类型为std_msgs::String
  // 1000为消息发布队列大小,当发布消息实际速度较慢时,Publisher会将消息存储在一定空间的队列中,当消息数量超过队列大小时,ROS会自动删除队列中最早入队的消息
  ros::Publisher chatter_pub = n.advertise<std_msgs::String>("chatter", 1000);

  // 设置循环的频率,单位为Hz
  // 当调用Rate::sleep()时,ROS节点会根据此处设置的频率休眠响应的时间,以保证维持一致的时间周期.
  ros::Rate loop_rate(10);

  int count = 0;
  // 发生异常,ros::ok()返回false,跳出循环
  // 异常包括 1.Ctrl+C/2.被另外同名节点踢掉线/3.节点调用了关闭函数ros::shutdown()/4.所有ros::NodeHandles句柄被销毁
  while (ros::ok())
  {
    // 初始化std_msgs::String类型的消息msg,msg只有一个成员data
    std_msgs::String msg;
    std::stringstream ss;
    ss << "hello world " << count;
    /*这一句一般出现在创建ROS话题的发布者（Publisher）节点程序中，是利用c++自带的头文件sstream，来实现利用输入输出流的方式往string里写东西，并且还可以拼接string和其他类型的变量。
    *该语句实现了string型的数据"hello world"和int型变量count的拼接，形成一个新的string。即如果count是１，那么hello world1会作为string被存放在ss当中。
    *使用ss.str()调用这个string。最后可以用ROS_INFO输出。  
    */
    msg.data = ss.str();
    
    // ROS_INFO类似于printf/cout,用来打印日志信息
    // c_str()函数返回一个指向正规C字符串的指针常量, 内容与本string串相同. 
    ROS_INFO("%s", msg.data.c_str());
    // 发布消息
    chatter_pub.publish(msg);

    // 用来处理节点订阅话题的所有回调函数(目前的发布节点没有订阅信息,此函数非必须,但为了保证不出错所以所有节点都默认加入该函数)
    ros::spinOnce();
  
    // 目前为止,Publisher一个周期的工作完成了,让他休息一段时间,100ms后开始下一周期的工作
    loop_rate.sleep();
    ++count;
  }

  return 0;
}
```

#### 创建订阅者Subscriber

```cpp
/**
 * listener.cpp
 * 创建一个Subscriber,订阅chatter话题，消息类型String
 */
 
#include "ros/ros.h"
#include "std_msgs/String.h"

// 接收到订阅的消息后，会进入消息回调函数
void chatterCallback(const std_msgs::String::ConstPtr& msg)
{
  // 将接收到的消息打印出来
  ROS_INFO("I heard: [%s]", msg->data.c_str());
}

int main(int argc, char **argv)
{
  // 初始化ROS节点
  ros::init(argc, argv, "listener");

  // 创建节点句柄
  ros::NodeHandle n;
  
  // 订阅节点需要声明订阅信息,该信息会在ROS Master中注册,Master会关注系统中是否存在发布该话题的节点,若存在则会帮助两个节点建立连接,完成数据传输
  // 创建一个Subscriber，订阅名为chatter的topic，注册回调函数chatterCallback
  ros::Subscriber sub = n.subscribe("chatter", 1000, chatterCallback);

  // 循环等待回调函数,此函数在ros::ok()返回false时退出
  ros::spin();

  return 0;
}
```

#### 编译功能包

设置编译规则`CmakeList.txt`

1. 设置头文件路径

    `include_directories(头文件相对路径)`
    
    ```bash
    ## Specify additional locations of header files
    ## Your package locations should be listed before other locations 
    include_directories(
      include
      ${catkin_INCLUDE_DIRS}
    )
    ```

2. 设置需要编译的代码和可生成的可执行文件 

   `add_executable(生成的可执行文件 参与编译的源码文件1 参与编译的源码文件2)`

3. 配置链接的第三方库文件

   `target_link_libraries(生成的可执行文件 链接的库1 链接的库2)`

4. 若生成的可执行文件需要依赖其他文件生成的代码,如消息类型,则需设置依赖

   `add_dependencies(生成的可执行文件 ${PROJECT_NAME}_generate_messages_cpp)`

   ```bash
   ## Declare a C++ executable
   ## With catkin_make all packages are built within a single CMake context
   ## The recommended prefix ensures that target names across packages don't collide
   add_executable(talker src/talker.cpp)
   target_link_libraries(talker ${catkin_LIBRARIES})
   #add_dependencies(talker ${PROJECT_NAME}_generate_messages_cpp)
   
   add_executable(listener src/listener.cpp)
   target_link_libraries(listener ${catkin_LIBRARIES})
   #add_dependencies(listener ${PROJECT_NAME}_generate_messages_cpp)
   ```

在工作空间路径下编译

```bash
cd ~/WORKSPACE
catkin_make
```

系统会生成`talker`和`listener`两个可执行文件,位于`~/WORKSPACE/devel/lib/PACKAGE`路径下

#### 运行功能包

每次编译之后都需要设置环境变量,假定已将环境变量脚本添加到终端配置文件中,运行以下代码刷新环境变量

```bash
source ~/.bashrc
```

1. 启动`roscore`

   ```bash
   roscore
   ```

2. 启动`Publisher`

   ```bash
   rosrun learning_communication talker
   ```

   **(TODO:添加运行截图)**

3. 启动`Subscriber`

   ```bash
   rosrun learning_communication listener
   ```

   **(TODO:添加运行截图)**

   若先运行`Subscriber`,节点会处于等待状态直到`Publisher`启动

至此,已经完成了话题通信.

#### 自定义话题消息

以上,`chatter`话题的消息类型为ROS预定的`String`,在ROS元功能包`common_msgs`中提供了许多不同消息类型,几乎满足一般需求.但有些情况下需要针对自己的机器人设计特定的消息类型

.msg文件是ROS中定义消息类型的文件,放置在功能包根目录下的msg文件夹中

例如:

```msg
string name
uint8 sex
uint8 age
```

还可以定义常量,在发布或订阅消息数据时可直接使用,相当于宏定义.如

```msg
uint8 unknown = 0
uint8 male    = 1
uint8 female  = 2
```

很多消息定义中还会包含一个标准格式的头信息`std_msgs/Header`,此处定义消息类型较为简单,也可以不加头信息

```msg
uint32 seq
time stamp
string frame_id
```

`seq`为消息顺序标识无,无需手动设置,`Publisher`发布消息时会自动累加;

`stamp`为消息中与数据相关联的时间戳,可用于时间同步

`frame_id`为消息中与数据相关联的参考坐标系id

为了使用这个自定义的消息类型,需要编译msg文件

1. 在`package.xml`中添加以下功能包依赖

   ```xml
   <build_depend>message_generation</build_depend>
   <exec_depend>message_runtime</exec_depend>  
   ```

2. 设置`CmakeList.txt`

   1. `find_package`中添加消息声称依赖的功能包`message_generation`

       ```xml
       find_package(catkin REQUIRED COMPONENTS
       	geometry_msgs
         roscpp
         rospy
         std_msgs
         message_generation
       )
       ```

   2. 设置`catkin`依赖

      ```bash
      catkin_package(
      	......
        CATKIN_DEPENDS geometry_msgs roscpp rospy std_msgs message_runtime
      	......
      )
      ```

   3. 设置需要编译的msg文件

       ```bash
       add_message_files(
       	FILES
       	Person.msg
       )
       generate_messages(
       	DEPENDENCIES
       	std_msgs
       )
       ```

3. 在根目录下`catkin_make`编译,使用如下命令查看自定义的Person消息类型

   ```bash
   rosmsg show person
   ```

   **(TODO:添加运行截图)**

   即可在代码中使用,参考`String`类型使用方法

### 服务编程

<img src="https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/ros-%E6%9C%8D%E5%8A%A1.png" alt="ros-服务" style="zoom: 33%;" />

下面以加法运算为例,`Client`发布两个需要相加的`int`变量,`Server`节点接收请求后完成运算并返回结果

#### 自定义服务数据

通过`.srv`文件进行接口定义,放置于功能包根目录下的`srv`文件夹中.

该文件包含请求与应答两个数据域,中间用---分割,内容格式与自定义话题相同

以加法运算为例,创建`AddTwoInts.srv`

```srv
int64 a
int64 b
---
int64 sum
```

与话题一样,需要在`package.xml`和`CMakeList.txt`中配置依赖和编译规则

1. `package.xml`添加以下依赖(与话题相同)

   ```xml
   <build_depend>message_generation</build_depend>
   <exec_depend>message_runtime</exec_depend>  
   ```

2. `CMakeList.txt`添加以下配置

   1. `find_package`中添加消息声称依赖的功能包`message_generation`(与话题相同)

       ```bash
       find_package(catkin REQUIRED COMPONENTS
        geometry_msgs
         roscpp
         rospy
         std_msgs
         message_generation
       )
       ```
       
   2. 设置需要编译的srv文件
   
      ```bash
      add_service_files(
      	FILES
      	AddTwoInts.srv
      )
      ```
      

#### 创建服务器Server

```cpp
/**
 * server.cpp
 * AddTwoInts Server
 */
 
#include "ros/ros.h"
// 使用ROS中的服务,必须包含服务数据类型的头文件,这个头文件是前文AddTwoInts.srv自动生成的
#include "learning_communication/AddTwoInts.h"

// service回调函数，输入参数req，输出参数res
bool add(learning_communication::AddTwoInts::Request  &req,
         learning_communication::AddTwoInts::Response &res)
{
  // 将输入参数中的请求数据相加，结果放到应答变量中,反馈到Client,回调函数返回true
  res.sum = req.a + req.b;
  ROS_INFO("request: x=%ld, y=%ld", (long int)req.a, (long int)req.b);
  ROS_INFO("sending back response: [%ld]", (long int)res.sum);
  
  return true;
}

int main(int argc, char **argv)
{
  // ROS节点初始化
  ros::init(argc, argv, "add_two_ints_server");
  
  // 创建节点句柄
  ros::NodeHandle n;

  // 创建一个名为add_two_ints的server，注册回调函数add()
  ros::ServiceServer service = n.advertiseService("add_two_ints", add);
  
  // 循环等待回调函数
  ROS_INFO("Ready to add two ints.");
  ros::spin();

  return 0;
}
```

可见,Server类似于话题中的Subscriber

#### 创建客户端Client

```cpp
/**
 * client.cpp
 * AddTwoInts Client
 */
 
#include <cstdlib>
#include "ros/ros.h"
#include "learning_communication/AddTwoInts.h"

int main(int argc, char **argv)
{
  // ROS节点初始化
  ros::init(argc, argv, "add_two_ints_client");
  
  // 从终端命令行获取两个加数
  if (argc != 3)
  {
    ROS_INFO("usage: add_two_ints_client X Y");
    return 1;
  }

  // 创建节点句柄
  ros::NodeHandle n;
  
  // 创建一个add_two_int的Client实例，服务类型是learning_communication::AddTwoInts
  ros::ServiceClient client = n.serviceClient<learning_communication::AddTwoInts>("add_two_ints");
  
  // 实例化一个服务数据类型的变量,包含两个成员:request和response
  // 创建learning_communication::AddTwoInts类型的service消息
  learning_communication::AddTwoInts srv;
  srv.request.a = atoll(argv[1]);
  srv.request.b = atoll(argv[2]);
  
  // 发布service请求，等待加法运算的应答结果
  if (client.call(srv))
  {
    ROS_INFO("Sum: %ld", (long int)srv.response.sum);
  }
  else
  {
    ROS_ERROR("Failed to call service add_two_ints");
    return 1;
  }

  return 0;
}
```

可见,Client类似于话题中的Publisher

#### 编译功能包

设置编译规则`CmakeList.txt`

```bash
add_executable(server src/server.cpp)
target_link_libraries(server ${catkin_LIBRARIES})
add_dependencies(server ${PROJECT_NAME}_gencpp)

add_executable(client src/client.cpp)
target_link_libraries(client ${catkin_LIBRARIES})
add_dependencies(client ${PROJECT_NAME}_gencpp)
```

catkin_make编译,刷新环境变量

#### 运行功能包

1. 启动`roscore`

   ```shell
   roscore
   ```


2. 启动`Server`

    ```shell
    rosrun learning_communication server
    ```

​		**(TODO:添加运行截图)**

3. 启动`Client`

    ```shell
    rosrun learning_communication client 3 5
    ```

​		**(TODO:添加运行截图)**

## 分布式多机通信

**(TODO:待添加)**

## ROS常用组件

### launch启动文件

每当我们需要运行一个ROS节点或工具时，都需要打开一个新的终端运行一个命令。当系统中的节点数量不断增加时，每个节点一个终端的模式会变得非常麻烦。启动文件（Launch File）便是ROS中一种同时启动多个节点的途径，还可以自动启动ROSMaster节点管理器，而且可以实现每个节点的各种配置，为多个节点的操作提供了很大便利。

下面是一个最简单的launch文件

```xml
<launch>
   <node pkg="turtlesim" name="sim1" type="turtlesim_node"/>
   <node pkg="turtlesim" name="sim2" type="turtlesim_node"/>
</launch>
```

#### 基本元素

1. `<launch>`

    XML文件必须要包含一个根元素，launch文件中的根元素采用`<launch>`标签定义，文件中的其他内容都必须包含在这个标签之中：

    ```xml
    <launch>
    ……
    </launch>
    ```

2. `<node>`

    启动文件的核心是启动ROS节点，采用`<node>`标签定义，语法如下：

    ```xml
    <node pkg="package-name" name="node-name" type="executable-name"/>
    ```

    从上边的定义规则可以看出，在启动文件中启动一个节点需要三个属性：name、pkg和type。

    * `name` : 节点运行的名称，将覆盖节点中`ros::init()`定义的节点名称；

    * `pkg` : 节点所在的功能包名称

    * `type` : 节点的可执行文件名称

    在某些情况下，我们还有可能用到以下属性：

    | 属性                 | 属性作用                                                     |
    | :------------------- | ------------------------------------------------------------ |
    | `output="screen"`    | 终端输出转储在当前的控制台上，而不是在日志文件中             |
    | `respawn="true"`     | 当roslaunch启动完所有该启动的节点之后，会监测每一个节点，保证它们正常的运行状态。对于任意节点，当它终止时，roslaunch 会将该节点重启 |
    | `required="true"`    | 当被此属性标记的节点终止时，roslaunch会将其他的节点一并终止。注意此属性不可以与`respawn="true"`一起描述同一个节点 |
    | `ns = "NAME_SPACE"`  | 这个属性可以让你在自定义的命名空间里运行节点                 |
    | `args = "arguments"` | 节点需要的输入参数                                           |

#### 参数设置

1. `<param>`

    parameter是ROS系统运行中的参数，存储在参数服务器中。在launch文件中可以通过`<param>`元素加载parameter。launch文件执行后，parameter就加载到ROS的参数服务器上了。

    每个活跃的节点都可以通过 ros::param::get()接口来获取parameter的值，用户也可以在终端中通过rosparam命令获得parameter的值。

    `<param>`使用方法:

    ```xml
    <param name="output_frame" value="odom"/>
    ```

    运行launch文件后，output_frame这个parameter的值就设置为odom，并且加载到ROS参数服务器上了。但是在很多复杂的系统中，参数的数量很多，如果这样一个一个的设置会非常麻烦，ROS也为我们提供了另外一种类似的参数加载方式:`<rosparam>`

    `<rosparam>`使用方法

    ```xml
    <rosparam file="$(find 2dnav_pr2)/config/costmap_common_params.yaml" command="load" ns="local_costmap" />
    ```

    `<rosparam>`可以帮助我们将一个yaml格式文件中的参数全部加载到ROS参数服务器中，需要设置command属性为“load”，还可以选择设置命名空间“ns”。

2. `<arg>`

    argument是launch文件内部的局部变量,仅限于launch文件内部使用,便于launch文件的重构,与ROS节点内部无关

    ```xml
    <arg name="MyArg"/>
    ```

    像上面这样，就简单地声明了一个参数，名叫demo，但是声明不等于定义，我们需要给他赋值，在赋值之后参数才能够发挥作用。

    ```xml
    <arg name="MyArg1" value="123"/>
    <arg name="MyArg2" default="123"/>
    ```

    以上是两种简单的赋值方法，两者的区别是使用后者赋值的参数可以在命令行中像下面这样被修改，前者则不行。

    ```shell
    roslaunch xxx xxx.launch MyArg2=1234
    ```

    launch文件中需要使用到argument时，可以使用如下方式调用：

    ```xml
    <arg name="arg-name" value="123"/>
    <param name="foo" value="$(arg arg-name)" />
    <node name="node" pkg="package" type="type "args="$(arg arg-name)" />
    ```

    当`$(arg arg_name)`出现在launch文件任意位置时，将会自动替代为所给参数的值。

#### 重映射机制

ROS的设计目标是提高代码的复用率，所以ROS社区中的很多功能包我们都可以拿来直接使用，而不需要关注功能包的内部实现。那么问题就来了，别人功能包的接口不一定和我们的系统兼容呀？

ROS提供一种重映射的机制，简单来说就是取别名，类似于C++中的别名机制，我们不需要修改别人功能包的接口，只需要将接口名称重映射一下，取个别名，我们的系统就认识了（接口的数据类型必须相同）。launch文件中的`<remap>`标签顾名思义重映射，emap标签里包含一个`original-name`和一个`new-name`，及原名称和新名称。

比如turtlebot的键盘控制节点，发布的速度控制指令话题可能是`/turtlebot/cmd_vel`，但是我们自己的机器人订阅的速度控制话题是`/cmd_vel`，这个时候使用`<remap>`就可以轻松解决问题，将`/turtlebot/cmd_vel`重映射为`/cmd_vel`，我们的机器人就可以接收到速度控制指令了：

```xml
<remap from="/turtlebot/cmd_vel" to="/cmd_vel"/>
```

重映射机制在ROS中的使用非常广泛，也非常重要，方法不止这一种，也可以在终端rosrun命令中实现重映射.

#### 嵌套复用

在复杂的系统当中，launch文件往往有很多，这些launch文件之间也会存在依赖关系。如果需要直接复用一个已有launch文件中的内容，可以使用`<include>`标签包含其他launch文件，这和C语言中的include几乎是一样的。

```xml
<include file="$(dirname)/other.launch" />
```

launch是ROS框架中非常实用、灵活的功能，它类似于一种高级编程语言，可以帮助我们管理启动系统时的方方面面。在使用ROS的过程中，很多情况下我们并不需要编写大量代码，仅需要使用已有的功能包，编辑一下launch文件，就可以完成很多机器人功能。

* 注 : 使用 `roslaunch` 命令 和 使用 `rosrun` 命令 单独运行每个节点之间的重要区别

  默认情况下，roslaunch 命令 从启动节点开始，标准输出信息会重定向到一个日志文件中，而不会像 rosrun 命令那样，将 log 信息显示在终端(console)上。日志文件所在路径： `∼/.ros/log/run_id/node_name-number-stdout.log`.如果想将标准输出信息显示在终端(console)上,需要在 node 元素中使用 output 属性：output=”screen”.但node 元素的 output 属性只能影响这个节点自己。除了 output 属性，我们可以使用 roslaunch命令行工具的 –screen 命令行选项强制性的在终端的窗口中显示所有节点的输出信息。

  ```shell
  roslaunch --screen package-name launch-file-name
  ```

### TF坐标变换

<img src="https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/ROS-ABTF%E5%8F%98%E6%8D%A2.png" alt="ROS-ABTF变换" style="zoom: 33%;" />

如图所示A,B两个坐标系,A坐标系下的位姿可以通过平移和旋转变换成B坐标系下的位姿,这里的平移和旋转可以用一个4*4的变换矩阵来描述(详见机器人学)

#### 创建TF广播器

```cpp
/**
 * turtle_tf_broadcaster.cpp
 **/
#include <ros/ros.h>
#include <tf/transform_broadcaster.h>
#include <turtlesim/Pose.h>

std::string turtle_name;

void poseCallback(const turtlesim::PoseConstPtr& msg)
{
    // tf广播器
    static tf::TransformBroadcaster br;

    // 根据乌龟当前的位姿，设置相对于世界坐标系的坐标变换
    tf::Transform transform;
    transform.setOrigin( tf::Vector3(msg->x, msg->y, 0.0) );
    tf::Quaternion q;
    q.setRPY(0, 0, msg->theta);
    transform.setRotation(q);

    // 发布坐标变换
    br.sendTransform(tf::StampedTransform(transform, ros::Time::now(), "world", turtle_name));
}

int main(int argc, char** argv)
{
    // 初始化节点
    ros::init(argc, argv, "my_tf_broadcaster");
    if (argc != 2)
    {
        ROS_ERROR("need turtle name as argument"); 
        return -1;
    };
    turtle_name = argv[1];

    // 订阅乌龟的pose信息
    ros::NodeHandle node;
    ros::Subscriber sub = node.subscribe(turtle_name+"/pose", 10, &poseCallback);

    ros::spin();

    return 0;
}
```

#### 创建TF监听器

```cpp
/**
 * turtle_tf_listener.cpp
 **/
#include <ros/ros.h>
#include <tf/transform_listener.h>
#include <geometry_msgs/Twist.h>
#include <turtlesim/Spawn.h>

int main(int argc, char** argv)
{
    // 初始化节点
    ros::init(argc, argv, "my_tf_listener");

    ros::NodeHandle node;

    // 通过服务调用，产生第二只乌龟turtle2
    ros::service::waitForService("spawn");
    ros::ServiceClient add_turtle = node.serviceClient<turtlesim::Spawn>("spawn");
    turtlesim::Spawn srv;
    add_turtle.call(srv);

    // 定义turtle2的速度控制发布器
    ros::Publisher turtle_vel = node.advertise<geometry_msgs::Twist>("turtle2/cmd_vel", 10);

    // tf监听器
    tf::TransformListener listener;

    ros::Rate rate(10.0);
    while (node.ok())
    {
        tf::StampedTransform transform;
        try
        {
            // 查找turtle2与turtle1的坐标变换
            listener.waitForTransform("/turtle2", "/turtle1", ros::Time(0), ros::Duration(3.0));
            listener.lookupTransform("/turtle2", "/turtle1", ros::Time(0), transform);
        }
        catch (tf::TransformException &ex) 
        {
            ROS_ERROR("%s",ex.what());
            ros::Duration(1.0).sleep();
            continue;
        }

        // 根据turtle1和turtle2之间的坐标变换，计算turtle2需要运动的线速度和角速度
        // 并发布速度控制指令，使turtle2向turtle1移动
        geometry_msgs::Twist vel_msg;
        vel_msg.angular.z = 4.0 * atan2(transform.getOrigin().y(),
                                        transform.getOrigin().x());
        vel_msg.linear.x = 0.5 * sqrt(pow(transform.getOrigin().x(), 2) +
                                      pow(transform.getOrigin().y(), 2));
        turtle_vel.publish(vel_msg);

        rate.sleep();
    }
    return 0;
}
```

#### 编译功能包

设置编译规则`CmakeList.txt`

```bash
add_executable(turtle_tf_broadcaster src/turtle_tf_broadcaster.cpp)
target_link_libraries(turtle_tf_broadcaster ${catkin_LIBRARIES})

add_executable(turtle_tf_listener src/turtle_tf_listener.cpp)
target_link_libraries(turtle_tf_listener ${catkin_LIBRARIES})
```

catkin_make编译,刷新环境变量

#### launch文件启动

```xml
 <launch>
    <!-- 海龟仿真器 -->
    <node pkg="turtlesim" type="turtlesim_node" name="sim"/>

    <!-- 键盘控制 -->
    <node pkg="turtlesim" type="turtle_teleop_key" name="teleop" output="screen"/>

    <!-- 两只海龟的tf广播 -->
    <node pkg="learning_tf" type="turtle_tf_broadcaster" args="/turtle1" name="turtle1_tf_broadcaster" />
    <node pkg="learning_tf" type="turtle_tf_broadcaster" args="/turtle2" name="turtle2_tf_broadcaster" />

    <!-- 监听tf广播，并且控制turtle2移动 -->
    <node pkg="learning_tf" type="turtle_tf_listener" name="listener" />

 </launch>
```

