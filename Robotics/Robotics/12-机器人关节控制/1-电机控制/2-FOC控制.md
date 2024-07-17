## 更新日志

2022.09.16 完善图片内容与代码，更新到速度闭环

<img src="https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220916003234988.png" alt="image-20220916003234988" style="zoom: 25%;" />

<img src="https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220916003249372.png" alt="image-20220916003249372" style="zoom: 25%;" />

## FOC框架引入

三向电机，分别为UVW三向，角度互差120度。若使用BLDC控制方法，如下图每次换向增加60度，转子只能到达六个位置，所以六步换向时会有振动。使用FOC控制方法可以使转子到达任意角度，所以运行起来会更加平滑。

<img src="https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/ED2759D27293A18F51A49E35A2A46EB0.png" alt="ED2759D27293A18F51A49E35A2A46EB0" style="zoom:50%;" />

如果想到达40度的位置，只需要在0度方向通电一段时间，在60度方向通电一段时间，再在空矢量的状态下通电一段时间（全桥000或111的位置为空矢量，空矢量的时长用来调节扭矩。后面会讲到），三段时间组成一个周期，以这个周期循环产生PWM，即可锁定至40度。若想到达其他角度，只需改变0度和60度的通电时长比例。

要想使磁场旋转起来，就需要输入正弦电压，但我们输入的是直流电，我们马上想到可以使用PWM波。通过不断改变**PWM脉宽**就可以模拟正弦电压，体现在电流上则为正弦电流。

下图为一个完整的FOC流程图：

<img src="https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220418110757084.png" alt="image-20220418110757084" style="zoom: 80%;" />

我们先来看正向通路：输入 $I_{d\_ref}$ 和 $I_{q\_ref}$ 与下文反馈通路采样得到的电流 $I_d$ 和 $I_q$ 进行PID控制输出 $U_d$ 和 $U_q$ （输入的 $I_{d\_ref}$ 通常为0， $I_{q\_ref}$ 前通常还需要接入一个速度PID构成速度环），再通过反Park变换转换成 $U_\alpha$ 和 $U_\beta$ ，通过SVPWM模块控制定时器产生六路互补的PWM信号，最后使用PWM信号控制全桥MOS管的通断，产生三向电压使电机转动。

再来看反馈通路：通过采样电阻采集任意两相电流，根据基尔霍夫电流定律可以算出第三相电流，将三向电流通过Clark变换转化成 $I_\alpha$ 和 $I_\beta$ ，再通过Park变换转换成 $I_d$ 和 $I_q$ ，作为反馈传入PID控制器构成电流环。

上图中的Park变换和反Park变换需要当前的角度作为输入；速度PID需要速度作为反馈。所以需要获得电机的速度与角度。角度和速度的获取方法分为有感和无感。有感方式使用霍尔元件（Hall Sensor），安装在电机上就可以检测电机磁铁的位置。无感使用观测器（observer）获得角度速度信息，本文将使用扩展卡尔曼滤波观测器（EKF），输入为  $U_\alpha$ 、 $U_\beta$ 、 $I_\alpha$ 、 $I_\beta$ 。使用无感方式不需要霍尔传感器，可以减少连接线的数量，也可以减小成本。

## 坐标变换

为什么要使用坐标变换？电机控制大多是在控制速度/转矩，需要用PID闭环控制正弦交流电压的幅值和角度，不是很容易实现，所以通过坐标变化把正弦交流信息分解成角度信息（Q轴控制转矩）和幅值信息（D轴控制磁场）单独控制。

**FOC的变换中要满足等幅值变换，即变换前后幅值不变。**

坐标变换都分为正向变换和反向变换，正向变换都是对电流进行操作的，反向变换都是对电压进行操作的。

下面的变换均采用联立和矩阵两种形式表示，以方便使用。

### Clark变换

Clark变换实现了三向坐标系 $(a,b,c)$ 与直角坐标系 $(\alpha,\beta)$ 间的转换。

<img src="https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/7C602099D7A9549EDA9C24D13AB98072.png" alt="7C602099D7A9549EDA9C24D13AB98072" style="zoom: 67%;" />

#### 正向Clark变换

Clark反变换则将两相信号转换为三相信号。已知三相坐标系 $(I_a,I_b,I_c)$ ，这三个基向量不是正交的，所以可以将其正交化为一个直角坐标系，命名为 $\alpha-\beta$ 坐标系，变换公式为：
$$
\left\{\begin{array}{l}
	\begin{aligned}
	I_\alpha&=I_a-I_b\text{cos}60-I_c\text{cos}60 \\
			&=I_a-\frac{1}{2}I_b-\frac{1}{2}I_c
	\end{aligned} \\
	\begin{aligned}
	I_\beta&=I_b\text{cos}30-I_c\text{cos}30 \\
		   &=\frac{\sqrt3}{2}I_b-\frac{\sqrt3}{2}I_c
	\end{aligned}
\end{array}\right.
$$

表示为矩阵形式：
$$
\left[\begin{array}{c}
	I_{\alpha} \\
	I_{\beta}
\end{array}\right]=
\left[\begin{array}{ccc}
	1 & -\frac{1}{2}       & -\frac{1}{2} \\
	0 & \frac{\sqrt{3}}{2} & -\frac{\sqrt{3}}{2}
\end{array}\right]
\left[\begin{array}{c}
	I_{a} \\
	I_{b} \\
	I_{c}
\end{array}\right]
$$
我们一般在电路中只采集两相电流，第三相电流可以使用基尔霍夫电流定律得出（ $I_a+I_b+I_c=0$ ），故上式也可整理为以下形式：
$$
\left\{\begin{array}{l}
	I_\alpha=\frac{3}{2}I_a \\
	I_\beta=\frac{\sqrt3}{2}I_a+\sqrt3I_b
\end{array}\right.
$$

矩阵形式：
$$
\left[\begin{array}{c}
	I_{\alpha} \\
	I_{\beta}
\end{array}\right]=
\left[\begin{array}{cc}
	\frac{3}{2} & 0\\
	\frac{\sqrt{3}}{2} & \sqrt{3}
\end{array}\right]
\left[\begin{array}{c}
	I_{a} \\
	I_{b} 
\end{array}\right]
$$
由于变换前后 $I_a$ 和 $I_\alpha$ 幅值要相同，所以要进行等幅值变换，变换系数为 $\frac{2}{3}$ ，即变为
$$
\left\{\begin{array}{l}
	I_\alpha=I_a \\
	I_\beta=\frac{1}{\sqrt3}(I_a+2I_b)
\end{array}\right.
$$
矩阵形式：
$$
\left[\begin{array}{c}
	I_{\alpha} \\
	I_{\beta}
\end{array}\right]=
\left[\begin{array}{cc}
	1 & 0\\
	\frac{1}{\sqrt{3}} & \frac{2}{\sqrt{3}}
\end{array}\right]
\left[\begin{array}{c}
	I_{a} \\
	I_{b} 
\end{array}\right]
$$
（这里的系数在后文SVPWM里相电压的幅值与电压空间矢量之间有一个 $\frac{3}{2}$ 的系数相抵消）

MATLAB实现为：

<img src="https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220330103933845.png" alt="image-20220330103933845" style="zoom: 80%;" />

#### 反向Clark变换

反Clark变换则将三相信号转换为两相信号。根据图可以写出：
$$
\left\{\begin{array}{l}
U_{a} =  U_{\alpha} \\
U_{b} = -\frac{1}{2}U_{\alpha} + \frac{\sqrt3}{2}U_{\beta}\\
U_{c} = -\frac{1}{2}U_{\alpha} - \frac{\sqrt3}{2}U_{\beta}
\end{array}\right.
$$
矩阵形式：
$$
\left[\begin{array}{c}
	U_{a} \\
	U_{b} \\
	U_{c}
\end{array}\right]=
\left[\begin{array}{ccc}
	1  & 0       \\
	-\frac{1}{2} & \frac{\sqrt{3}}{2} \\
	-\frac{1}{2} & -\frac{\sqrt{3}}{2}
\end{array}\right]
\left[\begin{array}{c}
	U_{\alpha} \\
	U_{\beta}
\end{array}\right]
$$

MATLAB实现为：

<img src="https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220330103915885.png" alt="image-20220330103915885" style="zoom:80%;" />

### Park变换

Park变换实现了两相坐标系 $(\alpha,\beta)$ 与转子坐标系 $(d,q)$ 间的转换，此变换可以将正弦变量线性化。其中 $d$ 指向转子中心， $q$ 指向切线方向， $\theta$ 是转子当前的角度，也就是说 $d-q$ 坐标系始终跟着转子同步旋转。

<img src="https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/A20BC4DCAD2986A86187F746C2EDE88A.png" alt="A20BC4DCAD2986A86187F746C2EDE88A" style="zoom: 67%;" />

#### 正向Park变换

则根据上图可以写出
$$
\left\{\begin{array}{l}
I_{d}=I_{\alpha} \cos\theta+I_{\beta} \sin\theta \\
I_{q}=-I_{\alpha} \sin\theta+I_{\beta} \cos\theta
\end{array}\right.
$$
很明显上述变换可以用旋转矩阵来表示，使用矩阵形式可以很方便地写出：
$$
\left[\begin{array}{l}
	I_{d} \\
	I_{q}
\end{array}\right]=
\left[\begin{array}{cc}
	 \cos \theta & \sin \theta \\
	-\sin \theta & \cos \theta
\end{array}\right]
\left[\begin{array}{l}
	I_{\alpha} \\
	I_{\beta}
\end{array}\right]
$$
（如果 $d$ 轴为0，则功率全部输出在 $q$ 轴上。）

MATLAB实现为

<img src="https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220330104003922.png" alt="image-20220330104003922" style="zoom:80%;" />

#### 反Park变换

根据上面的推导可以求得反Park变换
$$
\left\{\begin{array}{l}
U_{\alpha}=U_{d} \cos\theta-U_{q} \sin\theta \\
U_{\beta}= U_{d} \sin\theta+U_{q} \cos\theta
\end{array}\right.
$$
同理，使用旋转矩阵可以求出反变换的系数矩阵：
$$
\left[\begin{array}{l}
	U_{\alpha} \\
	U_{\beta}
\end{array}\right]=
\left[\begin{array}{cc}
	 \cos \theta & -\sin \theta \\
	 \sin \theta & \cos \theta
\end{array}\right]
\left[\begin{array}{l}
	U_{d} \\
	U_{q}
\end{array}\right]
$$

MATLAB实现为

<img src="https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220330103857619.png" alt="image-20220330103857619" style="zoom:80%;" />

### MATLAB仿真

为了更清楚地仿真，这里不用矩阵形式表示，如需矩阵形式可以看我写的另一篇文章。

请注意，正向变换都是对电流进行操作的，反向变换都是对电压进行操作的。但是在这节的仿真中，把正变换和反变换连在一起，这样做没有实际意义，只是为了验证变化算法。

输入Vd为0，Vq为1，角度为由0到2pi的连续值。

<img src="https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220330103716603.png" alt="image-20220330103716603" style="zoom: 80%;" />

再来看子模块内部，输入经过两个逆变换，再经过两个正变换。

<img src="https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220330103816443.png" alt="image-20220330103816443" style="zoom:80%;" />

运行查看波形（新版本MATLAB常值输入为一个圆圈）

<img src="https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220330104412589.png" alt="image-20220330104412589" style="zoom:50%;" />

## SVPWM

根据BLDC的六步换向，可以将一圈分为六个扇区，前文FOC引入章节已经讲过，只需要控制每个状态通电的时间就可以控制转子到达任意角度。这就是SVPWM。

SVPWM的输入为 $U_{\alpha}$ 和 $U_{\beta}$ ，输出为三向计数器的比较值。所以应该首先判断用哪两个相邻矢量，然后计算两个相邻矢量的作用时长，然后将作用时长转化成计数器的比较数值送入定时器。下面对这三个步骤进行讲解。

### 扇区判断

三相电压可以表示为（ $U_{m}$ 为电压幅值）：
$$
\begin{array}{l}
U_a = U_{m}cos\theta \\
U_b = U_{m}cos(\theta-\frac{2}{3}\pi) \\
U_c = U_{m}cos(\theta+\frac{2}{3}\pi)
\end{array}
$$
将其转换为 $\alpha-\beta$ 坐标系，可以算出
$$
\begin{array}{l}
U_{\alpha} = U_{m}cos\theta \\
U_{\beta} = U_{m}sin\theta
\end{array}
$$
从这个式子发现，可以从中算出角度信息从而可以判断在哪个扇区
$$
\theta = arctan(\frac{U_{\beta}}{U_{\alpha}})
$$
由于除法和反三角函数对于MCU来说计算量比较大。我们来找一个简便算法。

 $U_{\alpha}$ 是关于cos的三角函数， $U_{\beta}$ 是关于sin的三角函数，可以得到：
$$
\begin{array}{l}
扇区1:& U_{\alpha} > 0&,& U_{\beta} > 0\\
扇区2:& U_{\alpha} >or< 0&,& U_{\beta} > 0\\
扇区3:& U_{\alpha} < 0&,& U_{\beta} > 0\\
扇区4:& U_{\alpha} < 0&,& U_{\beta} < 0\\
扇区5:& U_{\alpha} >or< 0&,& U_{\beta} < 0\\
扇区6:& U_{\alpha} > 0&,& U_{\beta} < 0
\end{array}
$$
可以看到，通过 $U_{\beta}$ 的正负可以判断出是1/2/3扇区还是4/5/6扇区。

这个条件只将扇区分为两个部分，我们还需要几个条件来更细致地分。将每个扇区的反三角函数范围计算出来：
$$
\begin{aligned}
扇区1:& tan0^{\circ} >   \frac{U_{\beta}}{U_{\alpha}} > tan60^{\circ} &\Rightarrow& 
0 &>&        \frac{U_{\beta}}{U_{\alpha}} >& \sqrt{3}  \\
扇区2:& tan60^{\circ} >  \frac{U_{\beta}}{U_{\alpha}} > tan120^{\circ} &\Rightarrow& 
\sqrt{3} &>& \frac{U_{\beta}}{U_{\alpha}} >& -\sqrt{3} \\
扇区3:& tan120^{\circ} > \frac{U_{\beta}}{U_{\alpha}} > tan180^{\circ} &\Rightarrow&
-\sqrt{3} &>& \frac{U_{\beta}}{U_{\alpha}} >& 0        \\
扇区4:& tan180^{\circ} > \frac{U_{\beta}}{U_{\alpha}} > tan240^{\circ} &\Rightarrow&
0        &>& \frac{U_{\beta}}{U_{\alpha}} >& \sqrt{3}  \\
扇区5:& tan240^{\circ} > \frac{U_{\beta}}{U_{\alpha}} > tan300^{\circ} &\Rightarrow&
\sqrt{3} &>& \frac{U_{\beta}}{U_{\alpha}} >& -\sqrt{3} \\
扇区6:& tan300^{\circ} > \frac{U_{\beta}}{U_{\alpha}} > tan360^{\circ} &\Rightarrow& 
-\sqrt{3} &>& \frac{U_{\beta}}{U_{\alpha}} >& 0
\end{aligned}
$$
观察这个结论， $U_{\beta}$ 和 $\sqrt{3}U_{\alpha}$ 似乎有关系，回顾反Clark变换， $U_{b}$ 和 $U_{c}$ 的式子就是这种关系。所以可以把上面的结论往反Clark变换上凑。看一下反Clark变换的图像，注意我们需要的关系里的 $\sqrt{3}$ 是乘在 $U_{\alpha}$ 上的，所以我们把 $U_{\beta}$ 和 $U_{\alpha}$ 反一下，对应的公式为：
$$
\left\{\begin{array}{l}
U_{a} =  U_{\beta} \\
U_{b} = -\frac{1}{2}U_{\beta} + \frac{\sqrt3}{2}U_{\alpha}\\
U_{c} = -\frac{1}{2}U_{\beta} - \frac{\sqrt3}{2}U_{\alpha}
\end{array}\right.
$$


生成上述公式的图像，其中黄色的线为 $U_{a}$ 为 $U_{\beta}$ ，蓝色的线 $U_{b}$ 为 $\frac{\sqrt3}{2}U_{\alpha} - \frac{1}{2}U_{\beta}$ ，红色的线 $U_{c}$ 为 $-\frac{\sqrt3}{2}U_{\alpha} - \frac{1}{2}U_{\beta}$ ，

<img src="https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220330145027064.png" alt="image-20220330145027064" style="zoom:50%;" />

可以看到在每个扇区内总有一向大于0，两向小于0，所以 $U_{b}$ 和 $U_{c}$ 的正负可以当做判断条件之一。我们顺便还又一次得到了 $U_{\beta}$ 这个判断条件。整理一下上面的式子
$$
\begin{aligned}
扇区1:U_{\beta} > 0 , \frac{\sqrt3}{2}U_{\alpha} - \frac{1}{2}U_{\beta} >0 , -\frac{\sqrt3}{2}U_{\alpha} - \frac{1}{2}U_{\beta} < 0\\
扇区2:U_{\beta} > 0 , \frac{\sqrt3}{2}U_{\alpha} - \frac{1}{2}U_{\beta} <0 , -\frac{\sqrt3}{2}U_{\alpha} - \frac{1}{2}U_{\beta} < 0\\
扇区3:U_{\beta} > 0 , \frac{\sqrt3}{2}U_{\alpha} - \frac{1}{2}U_{\beta} <0 , -\frac{\sqrt3}{2}U_{\alpha} - \frac{1}{2}U_{\beta} > 0\\
扇区4:U_{\beta} < 0 , \frac{\sqrt3}{2}U_{\alpha} - \frac{1}{2}U_{\beta} <0 , -\frac{\sqrt3}{2}U_{\alpha} - \frac{1}{2}U_{\beta} > 0\\
扇区5:U_{\beta} < 0 , \frac{\sqrt3}{2}U_{\alpha} - \frac{1}{2}U_{\beta} >0 , -\frac{\sqrt3}{2}U_{\alpha} - \frac{1}{2}U_{\beta} > 0\\
扇区6:U_{\beta} < 0 , \frac{\sqrt3}{2}U_{\alpha} - \frac{1}{2}U_{\beta} >0 , -\frac{\sqrt3}{2}U_{\alpha} - \frac{1}{2}U_{\beta} < 0
\end{aligned}
$$
所以通过计算 $\frac{\sqrt3}{2}U_{\alpha} - \frac{1}{2}U_{\beta}$ 和 $-\frac{\sqrt3}{2}U_{\alpha} - \frac{1}{2}U_{\beta}$ 的正负可以判断出是1/6扇区，3/4扇区，2扇区，5扇区的哪一组。

综上，我们的判断条件有： $U_{\beta}$ 、 $\frac{\sqrt3}{2}U_{\alpha} - \frac{1}{2}U_{\beta}$ 和 $-\frac{\sqrt3}{2}U_{\alpha} - \frac{1}{2}U_{\beta}$ 。我们分别定义：
$$
\begin{array}{l}
U_a = U_{\beta} \\
U_b = \frac{\sqrt3}{2}U_{\alpha} - \frac{1}{2}U_{\beta}\\
U_c = -\frac{\sqrt3}{2}U_{\alpha} - \frac{1}{2}U_{\beta}
\end{array}
$$
综合这三个条件就可以判断是在哪个扇区 。那么有没有一种算法可以将这一堆判断数值化并转换成1~6的数字呢？可以用下面的公式：
$$
N=A+2B+4C
$$
式中A代表 $U_a$ 的正负，B代表 $U_b$ 的正负，C代表 $U_c$ 的正负，大于0为1，小于0为0。最后转换出来的的N即为1~6的数字：
$$
\begin{array}{c}
扇区 & 1 & 2 & 3 & 4 & 5 & 6 & \\
N   & 3 & 1 & 5 & 4 & 6 & 2 &
\end{array}
$$
至此，我们成功完成了扇区判断。

### 计算相邻矢量作用时长

控制相邻矢量作用时长就可以控制转子到达任意方向，下面进行分析。

#### 六个矢量的大小

六个MOS管可以产生8种状态

<img src="https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220330152650462.png" alt="image-20220330152650462" style="zoom:50%;" />

设上开下合为0（电流从O往对应的向流），上合下开为1（电流从对应的向往O流），表示其中的六个矢量。

<img src="https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220330152634407.png" alt="image-20220330152634407" style="zoom:50%;" />

放在一张图中即为：

<img src="https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220330152741018.png" alt="image-20220330152741018" style="zoom:50%;" />

还有两个零矢量（000和111），无电流，不产生磁场。

对于100的状态，可以等效为下面的电路图：

<img src="https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220330154344462.png" alt="image-20220330154344462" style="zoom: 25%;" />

可以计算出电机中三个相电压（每相相对于电机中间连接点的电压）
$$
\begin{aligned}
U_{AN} &=U_{A}-U_{N}=\frac{2}{3} U_{d c} \\
U_{BN} &=U_{B}-U_{N}=-\frac{1}{3} U_{d c} \\
U_{CN} &=U_{C}-U_{N}=-\frac{1}{3} U_{d c}
\end{aligned}
$$
同理可以计算其他所有方向矢量的相电压，可以看出，六个矢量的大小均为 $\frac{2}{3} U_{d c}$ ，即**SVPWM相电压幅值为 $\frac{2}{3} U_{d c}$** 

#### 电压利用率

电压利用率等于合成矢量的电压除以母线电压。下面在复平面计算合成矢量的电压 $U_{out}$ ：
$$
U_{out} = U_a +U_{b}\cdot e^{j\cdot \frac{2}{3}\pi}+U_{c}\cdot e^{j\cdot (-\frac{2}{3}\pi)}
$$
根据欧拉公式可以推导出：
$$
e^{jx}=cosx+jsinx
$$
又因为三相电压与相电压幅值之间的关系：
$$
\begin{array}{l}
U_a = U_{m}cos\theta \\
U_b = U_{m}cos(\theta-\frac{2}{3}\pi) \\
U_c = U_{m}cos(\theta+\frac{2}{3}\pi)
\end{array}
$$
带入可以计算出 $U_{out}$ ：
$$
U_{out}=\frac{3}{2}U_m\cdot e^{j\theta}
$$
合成矢量的电压是相电压幅值的 $\frac{3}{2}$ 倍，而SVPWM相电压幅值 $U_m$ 为 $\frac{2}{3} U_{d c}$ ，所以
$$
U_{out}=U_{dc}
$$
即**合成矢量的电压等于母线电压**。所以**SVPWM的电压利用率是100%**。

#### SVPWM输出电压是马鞍波

由于中间连接点N的点位 是浮动的，为三角波，而相电压是每相相对于电机中间连接点N的电压，所以相电压不是一个正弦波，而是一个正弦波与一个三角波叠加而成的，即为马鞍波。网图：

<img src="https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/d94c427b1d664ffe9b585d58e60482f6.jpg" alt="d94c427b1d664ffe9b585d58e60482f6" style="zoom:50%;" />

#### 矢量作用时长

合成矢量的电压是所在扇区两个矢量与空矢量不同时长的组合，其中 $T_N$ 为空矢量作用时长：
$$
U_{out}=U_x\frac{T_x}{T_s}+U_y\frac{T_y}{T_s}+U_N\frac{T_N}{T_s}
$$
由于SVPWM的输入是 $U_{\alpha}$ 和 $U_{\beta}$ ，但是要控制 $T_x$ 和 $T_y$ ，所以要找到他们的对应关系。

对于第一个扇区，将 $U_{out}$ 在 $\alpha-\beta$ 坐标系中表示：
$$
\begin{array}{l}
U_\alpha=|U_x|\frac{T_x}{T_s}+|U_y|\frac{T_y}{T_s}cos60^{\circ}\\
U_\beta=|U_y|\frac{T_y}{T_s}sin60^{\circ}
\end{array}
$$
其中 $|U_x|$ 和 $|U_y|$ 根据前面的计算均为 $\frac{2}{3} U_{d c}$ ，可以解出：
$$
\begin{array}{l}
T_x=\frac{\sqrt{3}T_S}{U_{dc}}(\frac{\sqrt{3}}{2}U_\alpha-\frac{1}{2}U_\beta)\\
T_y=\frac{\sqrt{3}T_S}{U_{dc}}U_\beta
\end{array}
$$
同理，可以计算出所有六个扇区：

第二扇区
$$
\begin{array}{l}
T_x=\frac{\sqrt{3}T_S}{U_{dc}}(-\frac{\sqrt{3}}{2}U_\alpha+\frac{1}{2}U_\beta)\\
T_y=\frac{\sqrt{3}T_S}{U_{dc}}(\frac{\sqrt{3}}{2}U_\alpha+\frac{1}{2}U_\beta)
\end{array}
$$
第三扇区
$$
\begin{array}{l}
T_x=\frac{\sqrt{3}T_S}{U_{dc}}U_\beta\\
T_y=\frac{\sqrt{3}T_S}{U_{dc}}(-\frac{\sqrt{3}}{2}U_\alpha-\frac{1}{2}U_\beta)
\end{array}
$$
第四扇区
$$
\begin{array}{l}
T_x=\frac{\sqrt{3}T_S}{U_{dc}}(-U_\beta)\\
T_y=\frac{\sqrt{3}T_S}{U_{dc}}(-\frac{\sqrt{3}}{2}U_\alpha+\frac{1}{2}U_\beta)
\end{array}
$$
第五扇区
$$
\begin{array}{l}
T_x=\frac{\sqrt{3}T_S}{U_{dc}}(-\frac{\sqrt{3}}{2}U_\alpha-\frac{1}{2}U_\beta)\\
T_y=\frac{\sqrt{3}T_S}{U_{dc}}(\frac{\sqrt{3}}{2}U_\alpha-\frac{1}{2}U_\beta)
\end{array}
$$
第六扇区 
$$
\begin{array}{l}
T_x=\frac{\sqrt{3}T_S}{U_{dc}}(\frac{\sqrt{3}}{2}U_\alpha+\frac{1}{2}U_\beta)\\
T_y=\frac{\sqrt{3}T_S}{U_{dc}}(-U_\beta)
\end{array}
$$
六个扇区中都有相同的项，其中包含前文判断扇区所用的 $U_1$ 、 $U_2$ 、 $U_3$ 。直接把前面已经计算过的变量拿过来使用，大大减少了计算量。式中的 $\frac{\sqrt{3}T_S}{U_{dc}}$ 为调制比，定义：
$$
\begin{array}{l}
U_{mr} = \frac{\sqrt{3}T_S}{U_{dc}} \\
X= \frac{\sqrt{3}T_S}{U_{dc}}U_\beta=U_{mr}U_1\\
Y= \frac{\sqrt{3}T_S}{U_{dc}}(\frac{\sqrt{3}}{2}U_\alpha-\frac{1}{2}U_\beta)=U_{mr}U_2\\
Z= \frac{\sqrt{3}T_S}{U_{dc}}(-\frac{\sqrt{3}}{2}U_\alpha-\frac{1}{2}U_\beta)=U_{mr}U_3
\end{array}
$$
可以将六个扇区表示为：
$$
\begin{array}{c}
& T_x & T_y  \\
扇区1&  Y  &  X  \\
扇区2& -Y  & -Z  \\
扇区3&  X  &  Z  \\
扇区4& -X  & -Y  \\
扇区5&  Z  &  Y  \\
扇区6& -Z  & -X  \\
\end{array}
$$

注意：当非零矢量作用时间 $Tx+Ty>Ts$ ，需要进行过饱和处理：
$$
\left\{\begin{array}{l}
T_{x}=\frac{T_{x}}{T_{x}+T_{y}} T_{s} \\
T_{y}=\frac{T_{y}}{T_{x}+T_{y}} T_{s}
\end{array}\right.
$$

### 定时器比较值计算

我们前文算出来的 $T_x$ 和 $T_y$ 以秒为单位，在单片机中使用定时器控制MOS管的通断需要配置比较值，所以需要把 $T_x$ 和 $T_y$ 转换为三个互补的定时器比较值 $T_1$ 、 $T_2$ 和 $T_3$ 。

定时器应设置为中心对齐模式，若为向上计数，计数器会从0开始计数到最大值，再反向从最大值计数到0；向下计数反之。故只需要控制前半个周期的比较值就可以产生相对中心对称的PWM波。

<img src="https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/CB0D861C81399F86BFB03E925F9AF8AC.png" alt="CB0D861C81399F86BFB03E925F9AF8AC" style="zoom:50%;" />

为了减少MOS管的开关损耗，提高其使用寿命，应尽量减少MOS管的开关次数。在一个扇区内切换状态的时候，合理使用零矢量可以保证每次切换只改变一个MOS管。

先来看第一扇区，以每次只改变一个MOS管为原则，则切换顺序为：
$$
000 \to 100 \to 110 \to 111 \to 110 \to 100 \to 000
$$
可以看到，切换顺序构成了一个环路。在一个周期内我们需要控制三段作用时长：
$$
T_s=T_x+T_y+T_N
$$
六个MOS需要产生六路PWM来控制他们的状态。由于上下半桥是互补的，所以只需要生成三个PWM：

<img src="https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220331151522966.png" alt="image-20220331151522966" style="zoom:50%;" />

由于是中心对齐模式，所以只需要控制半个周期的时长 $\frac{T_x}{2}$ 和 $\frac{T_y}{2}$ 。在半个周期内 $T_N$ 出现了两次，分别为000和111，在半个周期内将这两段时间平均分配。即为 $\frac{T_S-T_x-T_y}{4}$ 。

这样就可以计算三个定时器的比较值 $T_1$ 、 $T_2$ 和 $T_3$ ：
$$
\begin{array}{l}
T_1= \frac{T_S-T_x-T_y}{4}\\
T_2=T_1+\frac{T_x}{2}\\
T_3=T_2+\frac{T_y}{2}
\end{array}
$$
同理，可以计算出全部六个扇区的切换顺序，这里计算过程不再赘述。由图像和计算结果可以分析出，无论在哪个扇区中，三个定时器切换的图像都是由上图中三个方波构成，三个图像排列组合也正好就是六个扇区的组合方式。故为了方便程序运行，将六个扇区的定时器比较值归纳如下：

设
$$
\begin{array}{l}
T_a= \frac{T_S-T_x-T_y}{4}\\
T_b=T_a+\frac{T_x}{2}\\
T_c=T_b+\frac{T_y}{2}
\end{array}
$$
此时六个扇区可以表示为：
$$
\begin{array}{c}
  & 扇区1 & 扇区2 & 扇区3 & 扇区4 & 扇区5 & 扇区6 & \\
T1& T_a & T_b & T_c & T_c & T_b & T_a &\\
T2& T_b & T_a & T_a & T_b & T_c & T_c &\\
T3& T_c & T_c & T_b & T_a & T_a & T_b &
\end{array}
$$
也就是说编程时只需要计算 $T_a$ 、 $T_b$ 和 $T_c$ ，通过判断就可以得到对应扇区的比较值。

至此，SVPWM输出比较值 $T_1$ 、 $T_2$ 、 $T_3$ ，互补得到六个比较值，输入到定时器，输出三路PWM。

#### MATLAB仿真

假设需要产生10Khz的PWM波，则一个周期为0.0001秒。若单片机主频为180Mhz，预分频系数为100-1，由下面计算公式：（其中 $ARR$ 是计数值， $PSC$ 是预分频值）
$$
Fpwm(Hz) = \frac{主频(M)}{(ARR+1)*(PSC+1)}
$$
180,000,000/(18,000*100)=10,000Hz，则定时器的计数值应设置为18000-1。

在模型中设定 $Udc$ 为24， $Tpwm$ 为18000。

<img src="https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220331163919487.png" alt="image-20220331163919487" style="zoom:50%;" />

在foc子模块中，将park反变换的输出输入到SVPWM模块：

<img src="https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220331163836635.png" alt="image-20220331163836635" style="zoom: 67%;" />

SVPWM模块代码为：

```matlab
function [T1,T2,T3,sector] = fcn(Ualpha,Ubeta,Udc,Tpwm)

% 初始化
sector = single(0);
T1 = single(0);
T2 = single(0);
T3 = single(0);

% 第一步：扇区判断
% 计算三个临时变量
Ua = Ubeta;
Ub = (sqrt(3)*Ualpha - Ubeta)/2;
Uc = (-sqrt(3)*Ualpha - Ubeta)/2;
% 计算判断扇区所用的ABC的值
A=single(0);B=single(0);C=single(0);N=single(0);
if(Ua>0)
    A = single(1);
elseif(Ua<0)
    A = single(0);
end
if(Ub>0)
    B = single(1);
elseif(Ub<0)
    B = single(0);
end
if(Uc>0)
    C = single(1);
elseif(Uc<0)
    C = single(0);
end
% 计算判断扇区所用的N的值
N = A + 2*B + 4*C;
% 扇区判断
switch (N)   
    case 3
        sector = single(1);
    case 1
        sector = single(2);
    case 5
        sector = single(3);
    case 4
        sector = single(4);
    case 6
        sector = single(5);
    case 2
        sector = single(6);
end

% 第二步：计算相邻矢量作用时长
% 计算调制比
Umr = sqrt(3)*Tpwm/Udc;
% 计算三个临时变量
X = Umr * Ua;
Y = Umr * Ub;
Z = Umr * Uc;
% 分扇区计算Tx和Ty的值
Tx=single(0);Ty=single(0);
switch (sector)
    case 1
        Tx = Y; Ty = X;
    case 2
        Tx = -Y; Ty = -Z;
    case 3
        Tx = X; Ty = Z;
    case 4
        Tx = -X; Ty = -Y;
    case 5
        Tx = Z; Ty = Y;
    case 6
        Tx = -Z; Ty = -X;
end

% 第三步：定时器比较值计算
% 干啥用的？
if Tx+Ty > Tpwm
    Tx = Tx/(Tx+Ty);
    Ty = Ty/(Tx+Ty);
else
    Tx = Tx;
    Ty = Ty;
end
% 计算三个临时变量
Ta = (Tpwm-Tx-Ty)/4.0;
Tb = Ta+Tx/2.0;
Tc = Tb+Ty/2.0;
% 分扇区计算定时器比较值T1、T2和T3的值
switch (sector)
    case 1
        T1 = Ta; T2 = Tb; T3 = Tc;
    case 2
        T1 = Tb; T2 = Ta; T3 = Tc;
    case 3
        T1 = Tc; T2 = Ta; T3 = Tb;
    case 4
        T1 = Tc; T2 = Tb; T3 = Ta;
    case 5
        T1 = Tb; T2 = Tc; T3 = Ta;
    case 6
        T1 = Ta; T2 = Tc; T3 = Tb;
end

end
```

可以看到，定时器比较值为马鞍波

<img src="C:\Users\fanziqi\AppData\Roaming\Typora\typora-user-images\image-20220331165323898.png" alt="image-20220331165323898" style="zoom: 50%;" />

扇区为从1到6的循环

<img src="https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220331165348883.png" alt="image-20220331165348883" style="zoom:50%;" />

## 电流闭环

经过前文的反Park变换、SVPWM、定时器与全桥，输入的 $U_{d}$ 和 $U_{q}$ 最终转换为三相电压输出到电机。如果需要让电机以设定的电流值运行，就需要使用PI控制器闭环控制电流。但三相交流电流是不太容易实现闭环控制的，所以我们选择对直流电流 $I_{d}$ 和 $I_{q}$ 进行闭环控制。

<img src="https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220418111545651.png" alt="image-20220418111545651" style="zoom: 67%;" />

PI控制器输入目标参考电流 $I_{d_{ref}}$ 和 $I_{q_{ref}}$ ，输出 $U_{d}$ 和 $U_{q}$ ，现在还缺少反馈量 $I_{d}$ 和 $I_{q}$ ，这就需要用到前文讲到的Park与Clark正变换。安装采样电阻，用单片机的ADC采集全桥上任意两相的电流，通过基尔霍夫电流定律可计算第三相的电流，通过Clark变换计算出 $I_{\alpha}$ 和 $I_{\beta}$ ，再通过Park变换计算出反馈量 $I_{d}$ 和 $I_{q}$ 。

对于PI控制器参数的设定，以下为一个参考值（但还是需要自行调整）：
$$
\begin{array}{c}
  & P & I &\\
d& K_{pd}=\alpha L_d & K_{Id}=\alpha R\\
q& K_{pq}=\alpha L_q & K_{Iq}=\alpha R
\end{array}
$$
其中 $\alpha$ 的取值为：（其中 $\tau$ 为电机的时间常数）
$$
\alpha = \frac{2\pi}{\tau} \\
\tau = min\left\{\frac{L_d}{R},\frac{L_q}{R}\right\}
$$
电机分为表贴电机和内嵌式电机，表贴式电机的永磁体贴在转子表面，内嵌式电机的永磁体安装在转子内。我们常用的电机都是表贴电机，对于表贴电机， $L_d=L_q=L$ ，则可以得到PI控制器的参考参数：
$$
K_{p}=2\pi R \\
K_{I}=2\pi \frac{R^2}{L}
$$


## 角度和速度的获取

### 有感（HALL）

霍尔传感器分为60度和120度

<img src="https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/1C13C24117669CA4C27767785618F5F9.png" alt="1C13C24117669CA4C27767785618F5F9" style="zoom:50%;" />

画一下转一圈三个霍尔传感器的波形

<img src="https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/C18D380D267A0837CAFBC98D96941EA6.png" alt="C18D380D267A0837CAFBC98D96941EA6" style="zoom:50%;" />

可以看到，这两种排列方式除了组合方式不同，其他都一样。

单片机通过输入捕获采集三路高低电平的跳变，通过对三路信号进行异或，则转一圈可以进6次中断，进入中断后检测IO电平就可以知道电机对应角度。但现在一圈只能获取到6个固定的角度值，无法获取到如80度这个角度。这时可以对速度进行积分得到角度，速度的获取可以通过查询60-120之间定时器的计数值来获得。但是转到80度的时候没办法获取到120度时候的定时器计数值就无法获取当前段的速度，这时可以用前一段的速度近似为当前段的速度。

### 无感（EKF）

#### 引入

前面的有感部分，是在电机上安装霍尔传感器，引出三根线到单片机通过输入捕获算出当前角度，再与预设角度完成角度闭环。

而无感控制则不需要霍尔传感器，只需要三根UVW线输出到电机即可，去掉了霍尔传感器和三根线，节省了成本；有些使用场合无法使用霍尔传感器，则需要使用无感，比如空调压缩机，内部充满了润滑油，无法安装霍尔传感器；有些时候有感算法或硬件出现问题也可以切换至无感，防止系统闸机，比如汽车运行中霍尔传感器突然坏了，为了使整个系统正常运行，就可以临时切换到无感。上述这些都是无感控制的优点。无感控制现在已经越来越普及，空调、洗衣机、高端风扇、汽车都在用无感控制。

#### 状态观测器

观测器有很多种，扩展卡尔曼滤波观测器、滑膜观测器、龙伯格观测器、自适应观测器、磁链观测器等。其中扩展卡尔曼滤波观测器的低速性能比较好，所以本文重点讨论EKF。

状态观测器实质上就是用数学方法建立一个可以模拟真实被控对象的模型，用这个模型来得知一些无法通过测量得到的状态量。对于电机系统来说，如果没有传感器去测量电机的转速和转子位置，那么就可以通过搭建状态观测器来估算电机的转子和转子位置，这就是基于状态观测器的电机的无传感器控制。

但是使用这种方法建立的观测器有着诸多问题：

1. 抗干扰能力差：加入扰动或负载，此时的状态观测器很难保持正确的响应而导致输出错误或者系统崩溃；
2. 存在误差：误差主要存在与系统误差和测量误差
   1. 系统误差：在建模的时候电机的参数不可能完全精确，在建模的时候造成误差。
   2. 测量误差：观测器需要电流作为输入，而电流的采集就会存在误差。

所以为了解决以上问题，需要给状态观测器增加反馈，通过反馈来修正状态观测器的输出，让观测器尽可能的去贴近真实的电机。

![在这里插入图片描述](https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/017fc22e045b4488a08db81c18a6590f.png)

##### 状态空间表示

线性系统的状态空间方程为：
$$
\left\{\begin{array}{l}
\dot x = Ax+Bu\\
y=Hx
\end{array}\right.
$$
永磁同步电机的方程：
$$
\left\{\begin{array}{l}
U_\alpha = Ri_\alpha + L_s \frac{di_\alpha}{dt} - \omega_e \psi_f sin\theta\\
U_\beta = Ri_\beta + L_s \frac{di_\beta}{dt} + \omega_e \psi_f cos\theta
\end{array}\right.
$$
上述方程的含义为：将每一相抽象为一个电阻，一个电感和一个反电动势的串联，则每一相的电压为前面三项压降之和（反电动势为速度乘磁链）。方程中的电阻R、电感L、和磁链flux为电机的固有参数，电流可以通过采样电阻得到，只剩下了角度和转速，将电机方程转化为状态空间表达：
$$
\left\{\begin{array}{l}
\frac{d i_\alpha}{dt} = -\frac{R}{L_s}i_\alpha + \frac{1}{L_s}\omega_e\psi_f sin\theta + \frac{1}{L_s}U_\alpha \\
\frac{d i_\beta}{dt} = -\frac{R}{L_s}i_\beta - \frac{1}{L_s}\omega_e\psi_f cos\theta + \frac{1}{L_s}U_\beta \\
\frac{d \omega_e}{dt} = 0 \\
\frac{d \theta}{dt} = \omega_e
\end{array}\right.
$$
##### 矩阵化表示

接下来我们将上面的式子整理成矩阵形式，首先确认状态变量分别为 $ \dot{i_\alpha},\dot{i_\beta},\dot{\omega_e},\dot{\theta}$ ，则有：
$$
\begin{aligned}
\dot{x}=
\begin{bmatrix}
 \dot{i_\alpha} \\
 \dot{i_\beta} \\
 \dot{\omega_e} \\
 \dot{\theta} \\
\end{bmatrix}
\quad
x=
\begin{bmatrix}
 i_\alpha \\
 i_\beta \\
 \omega_e \\
 \theta \\
\end{bmatrix}
\end{aligned}
$$
输入 $u$ ，对于电机来说就是电压，我们选择 $\alpha-\beta$ 坐标系：
$$
\begin{aligned}
u=
\begin{bmatrix}
 U_\alpha \\
 U_\beta \\
\end{bmatrix}
\end{aligned}
$$
输出矩阵 $y$ 为通过采样电阻测得的电流：
$$
\begin{aligned}
y=
\begin{bmatrix}
 i_\alpha \\
 i_\beta \\
\end{bmatrix}
\end{aligned}
$$
则 $H$ 和 $B$ 矩阵就可以表示为：
$$
\begin{aligned}
H=
\begin{bmatrix}
 1 & 0 & 0 & 0 \\
 0 & 1 & 0 & 0 \\
\end{bmatrix}
\quad
B=
\begin{bmatrix}
 \frac{1}{L_s} & 0 \\
 0 & \frac{1}{L_s} \\
 0 & 0 \\
 0 & 0 \\
\end{bmatrix}
\end{aligned}
$$
此时矩阵形式的表示为：
$$
\begin{aligned}
\begin{bmatrix}
i_{\alpha} \\
\dot{i}_{\beta} \\
\dot{\omega} \\
\dot{\theta}
\end{bmatrix}
 & = 
\begin{bmatrix}
-\frac{R}{L_{S}} i_{\alpha}+\frac{1}{L_{s}} \omega_{e} \psi_{f} \sin \theta \\
-\frac{R}{L_{S}} i_{\beta}-\frac{1}{L_{s}} \omega_{e} \psi_{f} \cos \theta \\
0 \\
\omega_{e}
\end{bmatrix}+\begin{bmatrix}
\frac{1}{L_{s}} & 0 \\
0 & \frac{1}{L_{s}} \\
0 & 0 \\
0 & 0
\end{bmatrix}\begin{bmatrix}
u_{\alpha} \\
u_{\beta}
\end{bmatrix}\\
\begin{bmatrix}
i_{\alpha} \\
i_{\beta}
\end{bmatrix}
 & = 
\begin{bmatrix}
1 & 0 & 0 & 0 \\
0 & 1 & 0 & 0
\end{bmatrix}
\begin{bmatrix}
i_{\alpha} \\
i_{\beta} \\
\omega_{e} \\
\theta
\end{bmatrix}
\end{aligned}
$$
对比状态空间表示，无法显式地表示出线性的 $Ax$ ，因为电机系统不是线性的，所以用 $f(x)$ 这一非线性项替代这一项。 $f(x)$ 定义为：
$$
\begin{aligned}
f(x)=
\begin{bmatrix}
 -\frac{R}{L_s}i_\alpha + \frac{1}{L_s}\omega_e\psi_f sin\theta \\
 -\frac{R}{L_s}i_\beta - \frac{1}{L_s}\omega_e\psi_f cos\theta \\
 0 \\
 \omega_e \\
\end{bmatrix}
\end{aligned}
$$
则此时的状态空间方程变为：
$$
\left\{\begin{array}{l}
\dot x = f(x)+Bu\\
y=Hx
\end{array}\right.
$$

#### 扩展卡尔曼滤波器

关于卡尔曼滤波器的知识请看这篇文章：[手撕卡尔曼滤波器](https://www.robotsfan.com/posts/b4727fbe.html)

扩展卡尔曼滤波器（Extend Kalman Filter），简称EKF。带“扩展”二字，是因为卡尔曼滤波器只能处理线性系统，而电机是一个非线性，强耦合的系统，使用扩展卡尔曼滤波器可以处理这种非线性系统。

前文的状态空间方程中 $f(x)$ 是非线性的，如果想对非线性系统进行卡尔曼滤波，需要对其线性化（Linearization），泰勒级数展开是将非线性系统线性化的一种方法。将 $f(x)$ 泰勒级数展开并取前两项：
$$
\begin{aligned}
f(x)=f(x_0)+\frac{\partial f(x)}{\partial x}(x-x_0)
\end{aligned}
$$
对 $f(x)$ 求偏导：
$$
\begin{aligned}
F = \frac{\partial f(x)}{\partial x}=
\begin{bmatrix}
-\frac{R}{L_{S}} & 0 & \frac{\psi_{f} \sin \theta}{L_{S}} & \frac{\omega_{e} \psi_{f} \cos \theta}{L_{S}} \\
0 & -\frac{R}{L_{S}} & -\frac{\psi_{f} \cos \theta}{L_{S}} & \frac{\omega_{e} \psi_{f} \sin \theta}{L_{S}} \\
0 & 0 & 0 & 0 \\
0 & 0 & 1 & 0
\end{bmatrix}
\end{aligned}
$$
此时状态空间方程变为：
$$
\dot{x}=f(x_{0})+F(x-x_{0})+B u
$$
状态方程是建立在连续系统的基础上，需要将其转化成离散化系统后，才能在微控制器中实现卡尔曼滤波状态观测器。在离散化系统中， $\dot{x}=\frac{x_{k}-x_{k-1}}{\Delta t}$ ，则状态空间方程表示为：
$$
\begin{aligned}
\frac{x_{k}-x_{k-1}}{\Delta t}  &= f(x_{k-1})+B u_{k-1}\\
x_{k}&=x_{k-1}+(f(x_{k-1})+B u_{k-1}) \Delta t\\
&=(I+F\Delta t)x_{k-1}+B u_{k-1}\Delta t
\end{aligned}
$$
令 $A=(I+F\Delta t)$ ，扩展卡尔曼滤波器的流程为以下五步：

* 预测

  1. 计算预估值

     $\hat{x}_k^-=\hat{x}_{k-1}+(f(x_{k-1})+B u_{k-1}) \Delta t$

  2. 计算误差协方差

     $P_k^-=(I+F\Delta t)P_{k-1}(I+F\Delta t)^T+Q$

* 校正

  3. 计算卡尔曼增益

     $K_k=P_k^-H^T(HP_k^-H^T+R)^{-1}$

  4. 修正预估值

     $\hat{x}_k=\hat{x}_k^- + K_k(z_k-H\hat{x}_k^-)$ 

5. 更新误差协方差，用于下一次计算

   $P_k=(I-K_kH)P_k^-$ 

上面的五个方程中， $\Delta t$ 为采样时间， $Q$ 为模型误差， $R$ 为测量误差

在MATLAB中建立EKF观测器，需要建立全局变量x和P用于保存每一次迭代的值给下一次迭代使用：

```matlab
function x_posteriori  = fcn(Ialpha,Ibeta,Ualpha,Ubeta,Ls,Rs,Flux)

global x;
global P;

R=[0.02,0;0,0.02];
Q=[0.01,0,0,0;0,0.01,0,0;0,0,0.01,0;0,0,0,0.01];
Time=0.0001;

u=[Ualpha;Ubeta];
y=[Ialpha;Ibeta];
H=[1,0,0,0;0,1,0,0];
B=[1/Ls,0;0,1/Ls;0,0;0,0];
F=[-Rs/Ls,0,Flux*sin(x(4,1))/Ls,x(3,1)*Flux*cos(x(4,1))/Ls;0,-Rs/Ls,-Flux*cos(x(4,1))/Ls,x(3,1)*Flux*sin(x(4,1))/Ls;0,0,0,0;0,0,1,0];
f=[-Rs*Ialpha/Ls+x(3,1)*Flux*sin(x(4,1))/Ls;-Rs*Ibeta/Ls-x(3,1)*Flux*cos(x(4,1))/Ls;0;x(3,1)];
% 计算预估值
x_prior=x+(f+B*u)*Time;
% 计算误差协方差
A=(eye(4)+F*Time);
P_prior=A*P*A'+Q;
% 计算卡尔曼增益
K=(P_prior*H')/(H*P_prior*H'+R);
% 修正预估值
x_posteriori=x_prior+K*(y-H*x_prior);
% 更新误差协方差
P_posteriori=(eye(4)-K*H)*P_prior;

if x_posteriori(4,1)>(2*pi)
    x_posteriori(4,1)=x_posteriori(4,1)-(2*pi);
end

x=x_posteriori;
P=P_posteriori;
```

调整R矩阵和Q矩阵至最优，查看观测器效果：

<img src="https://fan-ziqi.oss-cn-beijing.aliyuncs.com/img/image-20220416201249667.png" alt="image-20220416201249667" style="zoom:50%;" />

蓝色为观测角度，黄色为真实角度。可以看到经过很短时间的迭代，观测器就已经可以很好地预测电机角度，至此完成了EKF无感算法。

## 速度闭环

前文电流闭环精准地控制了电机电流从而控制转矩，但要想精确地控制电机的速度就需要进行速度闭环。速度闭环是在电流闭环的外环，控制Id=0，通过前面有感或无感获取到的速度与速度参考作比较，通过PID控制Iq的值。

对于速度闭环PID，一班只是用PD控制。 $K_p$ 和 $K_d$ 的理论计算值为：
$$
K_P=\frac{\beta J}{1.5P\psi_f}\\
K_I=\beta K_P
$$
其中 $\beta$ 是速度环的带宽，一般为50rad/s； $J$ 为电机转动惯量，是电机的固有参数； $P$ 是电机的极对数； $\psi_f$ 是电机的磁链。

由于有观测器的存在，观测器的参数对速度环参数也会有影响，所以以上计算只是理论值，实际参数需要在理论值的基础上通过观察点击运行效果进行调整。
