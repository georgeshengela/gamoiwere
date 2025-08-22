import { useState } from "react";
import { Search, Calendar, User, ArrowRight, Tag, Filter, Clock, Eye, MessageCircle, Share2, BookOpen, TrendingUp, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link as WouterLink } from "wouter";

const BlogPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ყველა");
  const [sortBy, setSortBy] = useState("თარიღი");

  // Blog categories
  const categories = [
    "ყველა",
    "ტექნოლოგიები", 
    "მოდა და სტილი",
    "სახლისა და ბაღის",
    "სპორტი და ჯანმრთელობა",
    "ავტომობილები",
    "ღონისძიებები",
    "კომპანიის სიახლეები"
  ];

  // Sample blog posts - in real app this would come from API
  const blogPosts = [
    {
      id: 1,
      title: "2025 წლის ყველაზე პოპულარული ტექნოლოგიური ტრენდები",
      excerpt: "გაეცანით წელს ყველაზე მოთხოვნად ტექნოლოგიურ პროდუქტებს და ინოვაციებს, რომლებიც შეცვლიან ჩვენს ყოველდღიურ ცხოვრებას.",
      content: "ტექნოლოგიების სამყარო განუწყვეტლივ ვითარდება და 2025 წელი განსაკუთრებით საინტერესო ინოვაციებით გამოირჩევა...",
      author: "ნინო გელაშვილი",
      date: "2025-06-07",
      category: "ტექნოლოგიები",
      tags: ["AI", "გაჯეტები", "ინოვაცია"],
      image: "/api/placeholder/400/240",
      readTime: "5 წუთი",
      views: 2534,
      comments: 18,
      featured: true
    },
    {
      id: 2,
      title: "შემოდგომის ყველაზე მოდური კოლექციები",
      excerpt: "აღმოაჩინეთ ახალი სეზონის ყველაზე ტრენდული ფერები, სტილები და აქსესუარები, რომლებიც გააფერადებს თქვენს გარდერობს.",
      content: "შემოდგომა მოდის სამყაროში ყოველთვის განსაკუთრებული სეზონია...",
      author: "მარიამ ცხვედაძე",
      date: "2025-06-05",
      category: "მოდა და სტილი",
      tags: ["მოდა", "შემოდგომა", "სტილი"],
      image: "/api/placeholder/400/240",
      readTime: "4 წუთი",
      views: 1832,
      comments: 12,
      featured: false
    },
    {
      id: 3,
      title: "როგორ მოვაწყოთ სახლი მცირე ბიუჯეტით",
      excerpt: "პრაქტიკული რჩევები და იდეები, როგორ შექმნათ კომფორტული და ლამაზი საცხოვრებელი გარემო ისე, რომ ბევრი ფული არ დახარჯოთ.",
      content: "სახლის მოწყობა არ ნიშნავს, რომ უზარმაზარი თანხები უნდა დახარჯოთ...",
      author: "დავით რატიანი",
      date: "2025-06-03",
      category: "სახლისა და ბაღის",
      tags: ["დიზაინი", "ბიუჯეტი", "DIY"],
      image: "/api/placeholder/400/240",
      readTime: "7 წუთი",
      views: 3241,
      comments: 25,
      featured: true
    },
    {
      id: 4,
      title: "ჯანსაღი ცხოვრების 10 მარტივი წესი",
      excerpt: "ყოველდღიური ჩვევები და რჩევები, რომლებიც დაგეხმარებათ უკეთესი ფიზიკური და ფსიქოლოგიური ჯანმრთელობის მიღწევაში.",
      content: "ჯანსაღი ცხოვრების წესი არ ნიშნავს რადიკალურ ცვლილებებს...",
      author: "ლიკა ვეფხვაძე",
      date: "2025-06-01",
      category: "სპორტი და ჯანმრთელობა",
      tags: ["ჯანმრთელობა", "ფიტნესი", "კვება"],
      image: "/api/placeholder/400/240",
      readTime: "6 წუთი",
      views: 1967,
      comments: 15,
      featured: false
    },
    {
      id: 5,
      title: "ზაფხულის ღონისძიებები გამოიწერე.გე-ზე",
      excerpt: "მოემზადეთ ზაფხულის სეზონისთვის! ჩვენ ვგეგმავთ უამრავ საინტერესო ღონისძიებას და ფასდაკლებას.",
      content: "ზაფხული უახლოვდება და ჩვენ მოვამზადეთ საინტერესო ღონისძიებების კალენდარი...",
      author: "გამოიწერე ჯგუფი",
      date: "2025-05-30",
      category: "ღონისძიებები",
      tags: ["ღონისძიება", "ზაფხული", "ფასდაკლება"],
      image: "/api/placeholder/400/240",
      readTime: "3 წუთი",
      views: 4521,
      comments: 42,
      featured: true
    },
    {
      id: 6,
      title: "ელექტრო ავტომობილების მომავალი საქართველოში",
      excerpt: "ანალიზი იმისა, როგორ ვითარდება ელექტრო ავტომობილების ბაზარი ჩვენს ქვეყანაში და რა ცვლილებები მოელის მომავალში.",
      content: "ელექტრო ავტომობილები თანდათან ვიზუალურ რეალობად იქცევა საქართველოშიც...",
      author: "ნიკა გაბუნია",
      date: "2025-05-28",
      category: "ავტომობილები",
      tags: ["ელექტრო", "ავტო", "მომავალი"],
      image: "/api/placeholder/400/240",
      readTime: "8 წუთი",
      views: 2156,
      comments: 19,
      featured: false
    }
  ];

  // Filter posts based on search and category
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "ყველა" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort posts
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case "თარიღი":
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case "პოპულარობა":
        return b.views - a.views;
      case "კომენტარები":
        return b.comments - a.comments;
      default:
        return 0;
    }
  });

  const featuredPosts = blogPosts.filter(post => post.featured);
  const popularTags = ["ტექნოლოგია", "მოდა", "სახლი", "ჯანმრთელობა", "ავტო", "DIY", "ზაფხული", "ინოვაცია"];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
                <BookOpen className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              ბლოგი
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              გაეცანით ყველაზე ახალ სიახლეებს, რჩევებს და ტრენდებს 
              ონლაინ შოპინგის, ტექნოლოგიების და ცხოვრების სტილის შესახებ.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="ძებნა ბლოგში..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="თარიღი">თარიღით</option>
                <option value="პოპულარობა">პოპულარობით</option>
                <option value="კომენტარები">კომენტარებით</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Featured Posts */}
            {featuredPosts.length > 0 && selectedCategory === "ყველა" && searchQuery === "" && (
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Star className="h-6 w-6 text-yellow-500" />
                  <h2 className="text-2xl font-bold">რჩეული სტატიები</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredPosts.slice(0, 2).map((post) => (
                    <Card key={post.id} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="relative">
                        <img 
                          src={post.image} 
                          alt={post.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-yellow-500 text-yellow-900">{post.category}</Badge>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold mb-3 line-clamp-2">{post.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {post.author}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(post.date)}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {post.readTime}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {post.views.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" />
                              {post.comments}
                            </div>
                          </div>
                          <Button size="sm" asChild>
                            <WouterLink href={`/blog/${post.id}`}>
                              წაკითხვა
                              <ArrowRight className="h-4 w-4 ml-1" />
                            </WouterLink>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Blog Posts Grid */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {selectedCategory === "ყველა" ? "ყველა სტატია" : selectedCategory}
                </h2>
                <div className="text-sm text-gray-600">
                  ნაპოვნია {sortedPosts.length} სტატია
                </div>
              </div>

              {sortedPosts.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">სტატია ვერ მოიძებნა</h3>
                    <p className="text-gray-600">
                      სცადეთ სხვა საძიებო სიტყვები ან კატეგორია
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {sortedPosts.map((post) => (
                    <Card key={post.id} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
                      <div className="md:flex">
                        <div className="md:w-64 md:flex-shrink-0">
                          <img 
                            src={post.image} 
                            alt={post.title}
                            className="w-full h-48 md:h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-6 flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <Badge variant="secondary">{post.category}</Badge>
                            {post.featured && (
                              <Badge className="bg-yellow-500 text-yellow-900">
                                <Star className="h-3 w-3 mr-1" />
                                რჩეული
                              </Badge>
                            )}
                          </div>

                          <h3 className="text-xl font-bold mb-3 hover:text-primary cursor-pointer">
                            <WouterLink href={`/blog/${post.id}`}>
                              {post.title}
                            </WouterLink>
                          </h3>
                          
                          <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.map((tag) => (
                              <span 
                                key={tag}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                              >
                                <Tag className="h-3 w-3" />
                                {tag}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {post.author}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(post.date)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {post.readTime}
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  {post.views.toLocaleString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="h-4 w-4" />
                                  {post.comments}
                                </div>
                              </div>
                              <Button size="sm" asChild>
                                <WouterLink href={`/blog/${post.id}`}>
                                  წაკითხვა
                                  <ArrowRight className="h-4 w-4 ml-1" />
                                </WouterLink>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Popular Tags */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  პოპულარული თეგები
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <Button
                      key={tag}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setSearchQuery(tag)}
                    >
                      #{tag}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Posts */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  პოპულარული სტატიები
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {blogPosts
                  .sort((a, b) => b.views - a.views)
                  .slice(0, 5)
                  .map((post, index) => (
                    <div key={post.id} className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium line-clamp-2 hover:text-primary cursor-pointer">
                          <WouterLink href={`/blog/${post.id}`}>
                            {post.title}
                          </WouterLink>
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <Eye className="h-3 w-3" />
                          {post.views.toLocaleString()}
                          <span>•</span>
                          {formatDate(post.date)}
                        </div>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Newsletter */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="text-lg">გამოწერა</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  გამოიწერეთ ჩვენი ყოველკვირეული ნიუზლეტერი და მიიღეთ 
                  ახალი სტატიების შეტყობინებები პირველებს შორის.
                </p>
                <div className="space-y-3">
                  <Input placeholder="თქვენი ელ. ფოსტა" type="email" />
                  <Button className="w-full">
                    გამოწერა
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  ჩვენ არ გავაზიარებთ თქვენს ელ. ფოსტას მესამე პირებთან.
                </p>
              </CardContent>
            </Card>

            {/* Share */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  გაზიარება
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Facebook
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Twitter
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    LinkedIn
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;