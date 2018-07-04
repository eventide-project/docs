# Messaging::Category Module

`Messaging::Category` is a module that's often mixed in to handler classes. The module is also included into a receiver class that includes the [`Messaging::StreamName`](./messaging-stream-name.md) module.

The `Messaging::Category` provides the `category` class macro to the class that includes it

[View on GitHub](https://github.com/eventide-project/messaging/blob/master/lib/messaging/category.rb)

## Declaring the Category


      .
```
module Messaging
  module Category
    def self.included(cls)
      cls.extend Macro
    end

    def self.normalize(category)
      Casing::Camel.(category, symbol_to_string: true)
    end

    module Macro
      def category_macro(category)
        category = Category.normalize(category)
        self.send :define_method, :category do
          @category ||= category
        end

        self.send :define_method, :category= do |category|
          @category = category
        end
      end
      alias :category :category_macro
    end
  end
end
```
