import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SizeChartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productType: string;
}

const SizeChartModal = ({ open, onOpenChange, productType }: SizeChartModalProps) => {
  const isClothing = productType === 'clothing';
  const isShoes = productType === 'shoes';
  const isElectronics = productType === 'electronics';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>ზომების ცხრილი</DialogTitle>
          <DialogDescription>
            გამოიყენეთ ეს ცხრილი, რათა შეარჩიოთ თქვენთვის შესაფერისი ზომა.
          </DialogDescription>
        </DialogHeader>
        
        {isClothing && (
          <Tabs defaultValue="men" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="men">მამაკაცი</TabsTrigger>
              <TabsTrigger value="women">ქალი</TabsTrigger>
              <TabsTrigger value="international">საერთაშორისო</TabsTrigger>
            </TabsList>
            <TabsContent value="men" className="mt-4">
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">🏷️ Taobao მამაკაცის ტანსაცმლის ზომები</h4>
                <p className="text-sm text-blue-700">ჩინური ზომები განსხვავდება საერთაშორისო სტანდარტებისგან. ყოველთვის შეამოწმეთ გულმკერდის და სიმაღლის ზომები.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-2 text-xs">CN ზომა</th>
                      <th className="border border-gray-300 px-3 py-2 text-xs">სიმაღლე (სმ)</th>
                      <th className="border border-gray-300 px-3 py-2 text-xs">გულმკერდი (სმ)</th>
                      <th className="border border-gray-300 px-3 py-2 text-xs">საერთაშორისო ზომა</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 text-sm font-medium">M (165/88A)</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">160–165</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">88</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">XS</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-sm font-medium">L (170/92A)</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">165–170</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">92</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">S</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 text-sm font-medium">XL (175/96A)</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">170–175</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">96</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">M</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-sm font-medium">2XL (180/100A)</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">175–180</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">100</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">L</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 text-sm font-medium">3XL (185/104A)</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">180–185</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">104</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">XL</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-sm font-medium">4XL (190/108A)</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">185–190</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">108</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">XXL</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </TabsContent>
            <TabsContent value="women" className="mt-4">
              <div className="mb-4 p-3 bg-pink-50 rounded-lg border border-pink-200">
                <h4 className="font-semibold text-pink-900 mb-2">🏷️ Taobao ქალის ტანსაცმლის ზომები</h4>
                <p className="text-sm text-pink-700">ქალთა ზომები Taobao-ზე განსხვავდება ევროპული სტანდარტებისგან. შეამოწმეთ ბიუსტის, წელისა და სიმაღლის ზომები.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-2 text-xs">CN ზომა</th>
                      <th className="border border-gray-300 px-3 py-2 text-xs">სიმაღლე (სმ)</th>
                      <th className="border border-gray-300 px-3 py-2 text-xs">ბიუსტი (სმ)</th>
                      <th className="border border-gray-300 px-3 py-2 text-xs">წელი (სმ)</th>
                      <th className="border border-gray-300 px-3 py-2 text-xs">საერთაშორისო ზომა</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 text-sm font-medium">S (155/80A)</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">150–155</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">80</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">60–64</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">XS</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-sm font-medium">M (160/84A)</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">155–160</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">84</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">64–68</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">S</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 text-sm font-medium">L (165/88A)</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">160–165</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">88</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">68–72</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">M</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-sm font-medium">XL (170/92A)</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">165–170</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">92</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">72–76</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">L</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 text-sm font-medium">2XL (175/96A)</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">170–175</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">96</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">76–80</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">XL</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-sm font-medium">3XL (180/100A)</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">175–180</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">100</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">80–84</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">XXL</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </TabsContent>
            <TabsContent value="international" className="mt-4">
              <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-900 mb-2">🌍 საერთაშორისო ზომების კონვერტაცია</h4>
                <p className="text-sm text-orange-700">ყველა ქვეყნის ზომების შედარება ერთ ადგილას. იყოს თქვენი ზომის შერჩევა მარტივი.</p>
              </div>
              <div className="space-y-6">
                {/* Men's International Clothing Sizes */}
                <div>
                  <h5 className="font-semibold text-gray-800 mb-3">მამაკაცის ტანსაცმელი - საერთაშორისო ზომები</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-2 py-2">🇺🇸 USA</th>
                          <th className="border border-gray-300 px-2 py-2">🇪🇺 EU</th>
                          <th className="border border-gray-300 px-2 py-2">🇬🇧 UK</th>
                          <th className="border border-gray-300 px-2 py-2">🇨🇳 China</th>
                          <th className="border border-gray-300 px-2 py-2">🇯🇵 Japan</th>
                          <th className="border border-gray-300 px-2 py-2">🇰🇷 Korea</th>
                          <th className="border border-gray-300 px-2 py-2">გულმკერდი (სმ)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-2 py-2 font-medium">XS</td>
                          <td className="border border-gray-300 px-2 py-2">44</td>
                          <td className="border border-gray-300 px-2 py-2">34</td>
                          <td className="border border-gray-300 px-2 py-2">165/84A</td>
                          <td className="border border-gray-300 px-2 py-2">S</td>
                          <td className="border border-gray-300 px-2 py-2">85</td>
                          <td className="border border-gray-300 px-2 py-2">86-89</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-2 py-2 font-medium">S</td>
                          <td className="border border-gray-300 px-2 py-2">46</td>
                          <td className="border border-gray-300 px-2 py-2">36</td>
                          <td className="border border-gray-300 px-2 py-2">170/88A</td>
                          <td className="border border-gray-300 px-2 py-2">M</td>
                          <td className="border border-gray-300 px-2 py-2">90</td>
                          <td className="border border-gray-300 px-2 py-2">90-93</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-2 py-2 font-medium">M</td>
                          <td className="border border-gray-300 px-2 py-2">48</td>
                          <td className="border border-gray-300 px-2 py-2">38</td>
                          <td className="border border-gray-300 px-2 py-2">175/92A</td>
                          <td className="border border-gray-300 px-2 py-2">L</td>
                          <td className="border border-gray-300 px-2 py-2">95</td>
                          <td className="border border-gray-300 px-2 py-2">94-97</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-2 py-2 font-medium">L</td>
                          <td className="border border-gray-300 px-2 py-2">50</td>
                          <td className="border border-gray-300 px-2 py-2">40</td>
                          <td className="border border-gray-300 px-2 py-2">180/96A</td>
                          <td className="border border-gray-300 px-2 py-2">XL</td>
                          <td className="border border-gray-300 px-2 py-2">100</td>
                          <td className="border border-gray-300 px-2 py-2">98-101</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-2 py-2 font-medium">XL</td>
                          <td className="border border-gray-300 px-2 py-2">52</td>
                          <td className="border border-gray-300 px-2 py-2">42</td>
                          <td className="border border-gray-300 px-2 py-2">185/100A</td>
                          <td className="border border-gray-300 px-2 py-2">XXL</td>
                          <td className="border border-gray-300 px-2 py-2">105</td>
                          <td className="border border-gray-300 px-2 py-2">102-105</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-2 py-2 font-medium">XXL</td>
                          <td className="border border-gray-300 px-2 py-2">54</td>
                          <td className="border border-gray-300 px-2 py-2">44</td>
                          <td className="border border-gray-300 px-2 py-2">190/104A</td>
                          <td className="border border-gray-300 px-2 py-2">XXXL</td>
                          <td className="border border-gray-300 px-2 py-2">110</td>
                          <td className="border border-gray-300 px-2 py-2">106-109</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Women's International Clothing Sizes */}
                <div>
                  <h5 className="font-semibold text-gray-800 mb-3">ქალის ტანსაცმელი - საერთაშორისო ზომები</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-2 py-2">🇺🇸 USA</th>
                          <th className="border border-gray-300 px-2 py-2">🇪🇺 EU</th>
                          <th className="border border-gray-300 px-2 py-2">🇬🇧 UK</th>
                          <th className="border border-gray-300 px-2 py-2">🇨🇳 China</th>
                          <th className="border border-gray-300 px-2 py-2">🇯🇵 Japan</th>
                          <th className="border border-gray-300 px-2 py-2">🇰🇷 Korea</th>
                          <th className="border border-gray-300 px-2 py-2">გულმკერდი (სმ)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-2 py-2 font-medium">XS</td>
                          <td className="border border-gray-300 px-2 py-2">32</td>
                          <td className="border border-gray-300 px-2 py-2">6</td>
                          <td className="border border-gray-300 px-2 py-2">155/76A</td>
                          <td className="border border-gray-300 px-2 py-2">7</td>
                          <td className="border border-gray-300 px-2 py-2">44</td>
                          <td className="border border-gray-300 px-2 py-2">76-80</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-2 py-2 font-medium">S</td>
                          <td className="border border-gray-300 px-2 py-2">34</td>
                          <td className="border border-gray-300 px-2 py-2">8</td>
                          <td className="border border-gray-300 px-2 py-2">160/80A</td>
                          <td className="border border-gray-300 px-2 py-2">9</td>
                          <td className="border border-gray-300 px-2 py-2">55</td>
                          <td className="border border-gray-300 px-2 py-2">80-84</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-2 py-2 font-medium">M</td>
                          <td className="border border-gray-300 px-2 py-2">36</td>
                          <td className="border border-gray-300 px-2 py-2">10</td>
                          <td className="border border-gray-300 px-2 py-2">165/84A</td>
                          <td className="border border-gray-300 px-2 py-2">11</td>
                          <td className="border border-gray-300 px-2 py-2">66</td>
                          <td className="border border-gray-300 px-2 py-2">84-88</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-2 py-2 font-medium">L</td>
                          <td className="border border-gray-300 px-2 py-2">38</td>
                          <td className="border border-gray-300 px-2 py-2">12</td>
                          <td className="border border-gray-300 px-2 py-2">170/88A</td>
                          <td className="border border-gray-300 px-2 py-2">13</td>
                          <td className="border border-gray-300 px-2 py-2">77</td>
                          <td className="border border-gray-300 px-2 py-2">88-92</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-2 py-2 font-medium">XL</td>
                          <td className="border border-gray-300 px-2 py-2">40</td>
                          <td className="border border-gray-300 px-2 py-2">14</td>
                          <td className="border border-gray-300 px-2 py-2">175/92A</td>
                          <td className="border border-gray-300 px-2 py-2">15</td>
                          <td className="border border-gray-300 px-2 py-2">88</td>
                          <td className="border border-gray-300 px-2 py-2">92-96</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-2 py-2 font-medium">XXL</td>
                          <td className="border border-gray-300 px-2 py-2">42</td>
                          <td className="border border-gray-300 px-2 py-2">16</td>
                          <td className="border border-gray-300 px-2 py-2">180/96A</td>
                          <td className="border border-gray-300 px-2 py-2">17</td>
                          <td className="border border-gray-300 px-2 py-2">99</td>
                          <td className="border border-gray-300 px-2 py-2">96-100</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {isShoes && (
          <Tabs defaultValue="men" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="men">მამაკაცი</TabsTrigger>
              <TabsTrigger value="women">ქალი</TabsTrigger>
              <TabsTrigger value="international">საერთაშორისო</TabsTrigger>
            </TabsList>
            <TabsContent value="men" className="mt-4">
              <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">👟 Taobao ფეხსაცმლის ზომები</h4>
                <p className="text-sm text-green-700">ფეხსაცმლის ზომები Taobao-ზე განისაზღვრება ფეხის სიგრძით სანტიმეტრებში. გაზომეთ ფეხი და გამოიყენეთ ეს ცხრილი.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-2 text-xs">ფეხის სიგრძე (სმ)</th>
                      <th className="border border-gray-300 px-3 py-2 text-xs">China (CN)</th>
                      <th className="border border-gray-300 px-3 py-2 text-xs">EU</th>
                      <th className="border border-gray-300 px-3 py-2 text-xs">US (მამაკაცი)</th>
                      <th className="border border-gray-300 px-3 py-2 text-xs">US (ქალი)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 text-sm font-medium">22.0</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">34</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">35</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">-</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">5</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-sm font-medium">22.5</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">35</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">36</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">-</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">5.5</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 text-sm font-medium">23.0</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">36</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">37</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">5</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">6</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-sm font-medium">23.5</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">37</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">38</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">5.5</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">6.5</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 text-sm font-medium">24.0</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">38</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">39</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">6</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">7</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-sm font-medium">24.5</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">39</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">40</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">6.5</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">7.5</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 text-sm font-medium">25.0</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">40</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">41</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">7</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">8</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-sm font-medium">25.5</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">41</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">42</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">8</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">8.5</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 text-sm font-medium">26.0</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">42</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">43</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">8.5</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">9</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-sm font-medium">26.5</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">43</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">44</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">9</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">9.5</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 text-sm font-medium">27.0</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">44</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">45</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">10</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">10</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-sm font-medium">27.5</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">45</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">46</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">11</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">10.5</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="international" className="mt-4">
              <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <h4 className="font-semibold text-indigo-900 mb-2">👟 საერთაშორისო ფეხსაცმლის ზომები</h4>
                <p className="text-sm text-indigo-700">ყველა ქვეყნის ფეხსაცმლის ზომების შედარება და კონვერტაცია ერთ ადგილას.</p>
              </div>
              <div className="space-y-6">
                {/* Men's International Shoe Sizes */}
                <div>
                  <h5 className="font-semibold text-gray-800 mb-3">მამაკაცის ფეხსაცმელი - საერთაშორისო ზომები</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-2 py-2">🇺🇸 USA</th>
                          <th className="border border-gray-300 px-2 py-2">🇪🇺 EU</th>
                          <th className="border border-gray-300 px-2 py-2">🇬🇧 UK</th>
                          <th className="border border-gray-300 px-2 py-2">🇨🇳 China</th>
                          <th className="border border-gray-300 px-2 py-2">🇯🇵 Japan</th>
                          <th className="border border-gray-300 px-2 py-2">🇰🇷 Korea</th>
                          <th className="border border-gray-300 px-2 py-2">ფეხის სიგრძე (სმ)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-2 py-2 font-medium">7</td>
                          <td className="border border-gray-300 px-2 py-2">40</td>
                          <td className="border border-gray-300 px-2 py-2">6</td>
                          <td className="border border-gray-300 px-2 py-2">39</td>
                          <td className="border border-gray-300 px-2 py-2">25</td>
                          <td className="border border-gray-300 px-2 py-2">250</td>
                          <td className="border border-gray-300 px-2 py-2">24.5</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-2 py-2 font-medium">7.5</td>
                          <td className="border border-gray-300 px-2 py-2">41</td>
                          <td className="border border-gray-300 px-2 py-2">6.5</td>
                          <td className="border border-gray-300 px-2 py-2">40</td>
                          <td className="border border-gray-300 px-2 py-2">25.5</td>
                          <td className="border border-gray-300 px-2 py-2">255</td>
                          <td className="border border-gray-300 px-2 py-2">25.0</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-2 py-2 font-medium">8</td>
                          <td className="border border-gray-300 px-2 py-2">42</td>
                          <td className="border border-gray-300 px-2 py-2">7</td>
                          <td className="border border-gray-300 px-2 py-2">41</td>
                          <td className="border border-gray-300 px-2 py-2">26</td>
                          <td className="border border-gray-300 px-2 py-2">260</td>
                          <td className="border border-gray-300 px-2 py-2">25.5</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-2 py-2 font-medium">8.5</td>
                          <td className="border border-gray-300 px-2 py-2">43</td>
                          <td className="border border-gray-300 px-2 py-2">7.5</td>
                          <td className="border border-gray-300 px-2 py-2">42</td>
                          <td className="border border-gray-300 px-2 py-2">26.5</td>
                          <td className="border border-gray-300 px-2 py-2">265</td>
                          <td className="border border-gray-300 px-2 py-2">26.0</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-2 py-2 font-medium">9</td>
                          <td className="border border-gray-300 px-2 py-2">44</td>
                          <td className="border border-gray-300 px-2 py-2">8</td>
                          <td className="border border-gray-300 px-2 py-2">43</td>
                          <td className="border border-gray-300 px-2 py-2">27</td>
                          <td className="border border-gray-300 px-2 py-2">270</td>
                          <td className="border border-gray-300 px-2 py-2">26.5</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-2 py-2 font-medium">10</td>
                          <td className="border border-gray-300 px-2 py-2">45</td>
                          <td className="border border-gray-300 px-2 py-2">9</td>
                          <td className="border border-gray-300 px-2 py-2">44</td>
                          <td className="border border-gray-300 px-2 py-2">28</td>
                          <td className="border border-gray-300 px-2 py-2">280</td>
                          <td className="border border-gray-300 px-2 py-2">27.5</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-2 py-2 font-medium">11</td>
                          <td className="border border-gray-300 px-2 py-2">46</td>
                          <td className="border border-gray-300 px-2 py-2">10</td>
                          <td className="border border-gray-300 px-2 py-2">45</td>
                          <td className="border border-gray-300 px-2 py-2">29</td>
                          <td className="border border-gray-300 px-2 py-2">290</td>
                          <td className="border border-gray-300 px-2 py-2">28.0</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-2 py-2 font-medium">12</td>
                          <td className="border border-gray-300 px-2 py-2">47</td>
                          <td className="border border-gray-300 px-2 py-2">11</td>
                          <td className="border border-gray-300 px-2 py-2">46</td>
                          <td className="border border-gray-300 px-2 py-2">30</td>
                          <td className="border border-gray-300 px-2 py-2">300</td>
                          <td className="border border-gray-300 px-2 py-2">28.5</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Women's International Shoe Sizes */}
                <div>
                  <h5 className="font-semibold text-gray-800 mb-3">ქალის ფეხსაცმელი - საერთაშორისო ზომები</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-2 py-2">🇺🇸 USA</th>
                          <th className="border border-gray-300 px-2 py-2">🇪🇺 EU</th>
                          <th className="border border-gray-300 px-2 py-2">🇬🇧 UK</th>
                          <th className="border border-gray-300 px-2 py-2">🇨🇳 China</th>
                          <th className="border border-gray-300 px-2 py-2">🇯🇵 Japan</th>
                          <th className="border border-gray-300 px-2 py-2">🇰🇷 Korea</th>
                          <th className="border border-gray-300 px-2 py-2">ფეხის სიგრძე (სმ)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-2 py-2 font-medium">5</td>
                          <td className="border border-gray-300 px-2 py-2">35</td>
                          <td className="border border-gray-300 px-2 py-2">2.5</td>
                          <td className="border border-gray-300 px-2 py-2">34</td>
                          <td className="border border-gray-300 px-2 py-2">22</td>
                          <td className="border border-gray-300 px-2 py-2">220</td>
                          <td className="border border-gray-300 px-2 py-2">22.0</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-2 py-2 font-medium">5.5</td>
                          <td className="border border-gray-300 px-2 py-2">36</td>
                          <td className="border border-gray-300 px-2 py-2">3</td>
                          <td className="border border-gray-300 px-2 py-2">35</td>
                          <td className="border border-gray-300 px-2 py-2">22.5</td>
                          <td className="border border-gray-300 px-2 py-2">225</td>
                          <td className="border border-gray-300 px-2 py-2">22.5</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-2 py-2 font-medium">6</td>
                          <td className="border border-gray-300 px-2 py-2">37</td>
                          <td className="border border-gray-300 px-2 py-2">4</td>
                          <td className="border border-gray-300 px-2 py-2">36</td>
                          <td className="border border-gray-300 px-2 py-2">23</td>
                          <td className="border border-gray-300 px-2 py-2">230</td>
                          <td className="border border-gray-300 px-2 py-2">23.0</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-2 py-2 font-medium">7</td>
                          <td className="border border-gray-300 px-2 py-2">38</td>
                          <td className="border border-gray-300 px-2 py-2">4.5</td>
                          <td className="border border-gray-300 px-2 py-2">37</td>
                          <td className="border border-gray-300 px-2 py-2">24</td>
                          <td className="border border-gray-300 px-2 py-2">240</td>
                          <td className="border border-gray-300 px-2 py-2">23.5</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-2 py-2 font-medium">8</td>
                          <td className="border border-gray-300 px-2 py-2">39</td>
                          <td className="border border-gray-300 px-2 py-2">5.5</td>
                          <td className="border border-gray-300 px-2 py-2">38</td>
                          <td className="border border-gray-300 px-2 py-2">25</td>
                          <td className="border border-gray-300 px-2 py-2">250</td>
                          <td className="border border-gray-300 px-2 py-2">24.5</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-2 py-2 font-medium">9</td>
                          <td className="border border-gray-300 px-2 py-2">40</td>
                          <td className="border border-gray-300 px-2 py-2">6.5</td>
                          <td className="border border-gray-300 px-2 py-2">39</td>
                          <td className="border border-gray-300 px-2 py-2">26</td>
                          <td className="border border-gray-300 px-2 py-2">260</td>
                          <td className="border border-gray-300 px-2 py-2">25.0</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-2 py-2 font-medium">10</td>
                          <td className="border border-gray-300 px-2 py-2">41</td>
                          <td className="border border-gray-300 px-2 py-2">7.5</td>
                          <td className="border border-gray-300 px-2 py-2">40</td>
                          <td className="border border-gray-300 px-2 py-2">27</td>
                          <td className="border border-gray-300 px-2 py-2">270</td>
                          <td className="border border-gray-300 px-2 py-2">25.5</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-2 py-2 font-medium">11</td>
                          <td className="border border-gray-300 px-2 py-2">42</td>
                          <td className="border border-gray-300 px-2 py-2">8.5</td>
                          <td className="border border-gray-300 px-2 py-2">41</td>
                          <td className="border border-gray-300 px-2 py-2">28</td>
                          <td className="border border-gray-300 px-2 py-2">280</td>
                          <td className="border border-gray-300 px-2 py-2">26.0</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {isElectronics && (
          <div className="py-4">
            <p className="mb-4 text-gray-700">ეს პროდუქტი არ საჭიროებს ზომის შერჩევას.</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2">მახასიათებელი</th>
                    <th className="border border-gray-300 px-4 py-2">მნიშვნელობა</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">სიგრძე</td>
                    <td className="border border-gray-300 px-4 py-2">15.6 სმ</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">სიგანე</td>
                    <td className="border border-gray-300 px-4 py-2">7.8 სმ</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">სისქე</td>
                    <td className="border border-gray-300 px-4 py-2">0.8 სმ</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">წონა</td>
                    <td className="border border-gray-300 px-4 py-2">189 გრ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            დახურვა
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SizeChartModal;