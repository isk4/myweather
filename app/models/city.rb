class City < ApplicationRecord
    validates :name, uniqueness: true
    validates :key, uniqueness: true
end
