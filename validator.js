const $ = document.querySelector.bind(document);



// Hàm Validator( Constructor function)
function Validator(option) {

    // Hàm tìm thẻ div cha chứa toàn độ thẻ Input và label <'parentElement'>
    function getParent(element, selector) {
        while (element.parentElement) {
            if(element.matches(selector)) {
                return element;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {};
    // Hàm thực hiện nhập có đúng hay không
    function validate(inputElement, rule, errorElement, parentElement) {
        var errorMessage;        

        // Lấy ra các Rule của Selecter
        var rules = selectorRules[rule.selector]

            // Lặp qua từng rules và kiểm tra
            // Lặp đến khi có lỗi thì dừng kiểm tra
            for(var i=0; i<rules.length; i++) {
                switch (inputElement.type) {
                    case 'radio':
                    case 'checkbox':
                        errorMessage = rules[i](
                            $(rule.selector + ':checked')
                        ); 
                        
                        break;
                    default: 
                        errorMessage = rules[i](inputElement.value); 
                }
                if(errorMessage) break;
            }
         

            if (errorMessage) {
                errorElement.innerText = errorMessage
                parentElement.classList.add('invalid')
            } else {
                errorElement.innerText = ''
                parentElement.classList.remove('invalid')
            }

        return !errorMessage;
    }


    // Định nghĩa fỏm cần tác động
    var formElements = document.querySelector(option.form);
    


    if (formElements) {

        // Khi Submit Form (Bấm nút đăng kí sẽ rà soát lại form)
        formElements.onsubmit = function(e) {
            e.preventDefault()


            var isFormValid = true;


                    // Thực hiện lặp qua từng rules và Validate lấy ngay cái lỗi option.RULES đầu tiên
                    option.rules.forEach(function(rule) {

                        var inputElements = formElements.querySelectorAll(rule.selector)

                        Array.from(inputElements).forEach(function(inputElement) {

                            var parentElement = inputElement.closest(option.formGroupSelector);
            
                            // var errorElement = getParent(inputElement, option.formGroupSelector).querySelector('.form--message');
                            var errorElement = parentElement.querySelector('.form--message');
            
            
                            var isValid = validate(inputElement, rule, errorElement, parentElement)
                            if (!isValid) {
                                isFormValid = false;
                            }
                            
                        });
                    });  
            


            // Lấy ra toàn bộ các HTML có thẻ "name"
            var enableInputs = formElements.querySelectorAll('[name]:not([disabled])'); 
            // OR var enableInputs = formElements.querySelectorAll('input')
            // Phút 30:00 F8 - Form Validator phần 2; disabled: dùng để vô hiệu hóa DOM HTML(gán trục tiếp vào html Attributes)                        

            if (isFormValid) {    
                var formValues = Array.from(enableInputs).reduce(function(values, input) {
                    
                    
                    switch (input.type) {
                        case 'radio': 
                            // values[input.name] = 
                            // formElements.querySelector('input[name="' + input.name +'"]:checked').value;
                            if (input.matches('input:checked')) {
                                values[input.name] = input.value;
                            } 
                                break;
                        case 'checkbox':
                            if (!input.matches(':checked')) return values;

                            if (!Array.isArray(values[input.name])) {
                                values[input.name] = [];
                            }

                            values[input.name].push(input.value);
                                break;
                        case 'file':                         
                            values[input.name] = input.files;
                                break;
                        default: values[input.name] = input.value;

                    }

                    console.log(values)
                    return values;
                }, {});
                
                if (typeof option.onSubmit === 'function') {
                    option.onSubmit(formValues);
                } 
            } 
                // Trường hợp submit với hành vi mặc định
                else {
                    console.log("co loi")
                }
            }


        // // Tạo ra thẻ Span.form--message        
        // var createSpan = formElements.querySelectorAll('.form--group')     
               
        // var messages = Array.from(createSpan).map(function(span) {
        //     var newSpan = document.createElement('span');
        //     newSpan.setAttribute('class', 'form--message');

        //     return span.appendChild(newSpan);           
        // })

        
        // Xử lý lặp qua mỗi rules(sự kiện blur,...)
        option.rules.forEach(function(rule) {
            
                // Thêm object của các lệnh rules
                if (Array.isArray(selectorRules[rule.selector])) {
                    selectorRules[rule.selector].push(rule.test);
                } else {
                    selectorRules[rule.selector] = [rule.test];
                }
    
    
                var inputElements = formElements.querySelectorAll(rule.selector)
                


                Array.from(inputElements).forEach(function(inputElement) {
                
                    var parentElement = inputElement.closest(option.formGroupSelector);
                    var errorElement = parentElement.querySelector('.form--message');
    
                    if (inputElement) {
                        // Xử lý blur khỏi inPut
                        inputElement.onblur = function() {                    
                            validate(inputElement, rule, errorElement, parentElement)       
                        }                  
                        
                        // Xử lý mồi khi người dùng nhập kí tự vào input
                            inputElement.oninput = function() { 
                            errorElement.innerText = ''
                            parentElement.classList.remove('invalid')
                        }
                    } 
                });
        })

    }

}


// Định nghĩa các rules
// Nguyên tác các rules
// 1. Khi có lỗi thì trả ra message lỗi
// 2. Khi hợp lệ thì không trả ra gì cả (undefined)
Validator.isRequired = function(selector, message) {

    return {
        selector: selector,
        test: function(value) {
            return value.trim() ? undefined : message || 'Vui lòng nhập trường này';
        }
    }
}

Validator.isRadio = function(selector, message) {

    return {
        selector: selector,
        test: function(value) {
            return value ? undefined : message || 'Vui lòng nhập trường này';
        }
    }
}

Validator.isEmail = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;
            return regex.test(value) ? undefined : message || 'Vui lòng nhập email vào trường này'
        }
    }
}

Validator.isPassword = function(selector, min, message) {
    return {
        selector: selector,
        test: function(value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự`
        }
    }
}


Validator.isPasswordAgain = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            return value == $('#form-1 #password').value ? undefined : message || `Giá trị nhập vào không chính xác`
        }
    }
}
