# 34-关键词const

const是一种“伪”关键词，他不像void int，const对代码的生成不会造成什么影响。它类似于private、public这样的关键词，它是对开发人员写代码强制特定的规则。const是你做出的承诺，它承诺某些东西将是不变的。（这种承诺是可以打破的，你是否遵守承诺取决于你自己，但是请遵守你自己的承诺）

## 基础用法

下面演示const最基础的应用场景，const在程序中一般修饰一个需要保持不变的数字，比如`MAX_AGE`

```cpp
int MAX_AGE = 90;
MAX_AGE = 100; //正确，a的值可以被修改

const int MAX_AGE = 90;
MAX_AGE = 100; //错误，const常量不能被修改
```

## 修饰指针

再来讨论一下指针的问题。首先声明一个未被const修饰的整形指针a：（定义`int MAX_AGE = 90;`）

```cpp
int* a = new int;
*a = 2;//可以改变指针指向的内容
a = &MAX_AGE;//可以改变指针变量指向的地址
std::cout << *a << std::endl;//可以读取指针指向的内容
```

此时在`*`前加上`const`，就变成了**常量指针**，意味着不能修改指针指向的内容：

常量指针有两种写法，`const int *`和`int const *`都是可以的

```cpp
const int* b = new int;
*b = 2;//错误。不可以改变指针指向的内容
b = &MAX_AGE;//可以改变指针变量指向的地址
std::cout << *b << std::endl;//可以读取指针指向的内容
```

如果在`*`后加上`const`，就变成了**指针常量**，意味着指针自身的值是一个常量，不可改变，始终指向同一个地址。在定义的同时必须初始化：

指针常量只能写成`int * const`

```cpp
int* const c = new int;
*c = 2;//可以改变指针指向的内容
c = &MAX_AGE;//错误。不可以改变指针变量指向的地址
std::cout << *c << std::endl;//可以读取指针指向的内容
```

同理，如果写成`const int* const d = new int;`，即意味着不能改变指针指向的内容，也不能改变指针变量指向的地址。

## 类内方法中使用const

在类中的方法名后加上const，表示方法不会修改任何实际的类，因此不能修改类成员变量。

```cpp
class Entity
{
private:
	int m_x, m_y;
public:
	int GetX() const
	{
        m_x = 2;//错误，不能修改类成员变量
		return m_x;//只能读不能写
	}
};
```

假如此时有一个函数，使用了常量引用，它保证了函数内不会对这个类做任何的修改。

```cpp
void PrintEntity(const Entity& e)
{
	std::cout << e.GetX() << std::endl;
}
```

但此时将`GetX()`方法后的`const`去掉，上面函数内就不能调用GetX了。因为GetX函数已经不能保证它不会写入Entity了。**常对象只能调用常函数**。所以我们常常会见到函数的两个版本，此时常对象就会调用带有const的那个版本：

```cpp
int GetX() const
{
    return m_x;
}
int GetX()
{
    return m_x;
}
```

综上所诉，如果你的方法实际上没有修改类或者他们不应该修改类，那就把他们标记成const。否则在有常量引用的情况下就用不了你的方法了。

------

**文章作者:** [范子琦](https://github.com/fan-ziqi)

**文章链接:** https://www.fanziqi.site/categories/C/

**版权声明:** 本博客所有文章除特别声明外，均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 许可协议。转载请注明来自 [范子琦的博客](http://www.fanziqi.site/)！